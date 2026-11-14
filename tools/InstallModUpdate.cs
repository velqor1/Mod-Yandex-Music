// Build with the Windows .NET Framework compiler. Does not depend on PowerShell policy.
using System;
using System.IO;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Web.Script.Serialization;
using Microsoft.Win32;
class InstallModUpdate {
  class Entry { public string path, backup; public bool existed; }
  static readonly JavaScriptSerializer Json = new JavaScriptSerializer();
  static string Option(string[] args,string name,string fallback=null) { var key="--"+name+"=";var match=args.FirstOrDefault(a=>a.StartsWith(key,StringComparison.Ordinal));return match==null?fallback:match.Substring(key.Length); }
  static bool Flag(string[] args,string name) {return args.Contains("--"+name);}
  static bool Same(string a,string b) {return string.Equals(a,b,StringComparison.OrdinalIgnoreCase);}
  static string CheckedDirectory(string value) {
    if(string.IsNullOrWhiteSpace(value)||!Path.IsPathRooted(value))throw new Exception("Installation requires an absolute path");
    string full=Path.GetFullPath(value).TrimEnd(Path.DirectorySeparatorChar);
    var blocked=new[]{Path.GetPathRoot(full).TrimEnd('\\'),Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles),Environment.GetFolderPath(Environment.SpecialFolder.Windows)};
    if(full.Length<8||blocked.Any(p=>Same(p,full)))throw new Exception("Unsafe installation directory");
    for(var walk=new DirectoryInfo(full);walk!=null;walk=walk.Parent)if(walk.Exists&&(walk.Attributes&FileAttributes.ReparsePoint)!=0)throw new Exception("Reparse directories are not supported");
    return full;
  }
  static string ProcessPath(Process p) {try{return p.MainModule.FileName;}catch{return "";}}
  static IEnumerable<string> PayloadFiles(string folder) {
    foreach(var file in Directory.GetFiles(folder)){if((File.GetAttributes(file)&FileAttributes.ReparsePoint)!=0)throw new Exception("Reparse file in payload");yield return file;}
    foreach(var dir in Directory.GetDirectories(folder)){if((File.GetAttributes(dir)&FileAttributes.ReparsePoint)!=0)throw new Exception("Reparse directory in payload");foreach(var f in PayloadFiles(dir))yield return f;}
  }
  static void Integrate(string target,string exe,string version) {
    // Existing shortcuts pointing at another installation are deliberately left alone.
    dynamic shell=Activator.CreateInstance(Type.GetTypeFromProgID("WScript.Shell"));
    string start=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Programs),"Яндекс Музыка Mod");Directory.CreateDirectory(start);
    foreach(string linkPath in new[]{Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory),"Яндекс Музыка Mod.lnk"),Path.Combine(start,"Яндекс Музыка Mod.lnk")}){
      dynamic link=shell.CreateShortcut(linkPath);
      if(File.Exists(linkPath)&&!Same((string)link.TargetPath,exe))continue;
      link.TargetPath=exe;link.WorkingDirectory=target;link.IconLocation=exe+",0";link.Save();
    }
    const string prefix=@"Software\Microsoft\Windows\CurrentVersion\Uninstall\";
    string keyName="YandexMusic";
    using(var prior=Registry.CurrentUser.OpenSubKey(prefix+keyName)){
      string old=prior==null?null:prior.GetValue("InstallLocation") as string;
      if(!string.IsNullOrEmpty(old)&&!Same(old,target)){
        using(var sha=System.Security.Cryptography.SHA256.Create())keyName="YandexMusicMod-"+BitConverter.ToString(sha.ComputeHash(Encoding.UTF8.GetBytes(target.ToLowerInvariant()))).Replace("-","").Substring(0,12);
      }
    }
    using(var key=Registry.CurrentUser.CreateSubKey(prefix+keyName)){
      key.SetValue("DisplayName","Яндекс Музыка Mod");key.SetValue("DisplayVersion",version);key.SetValue("Publisher","velqor1");key.SetValue("InstallLocation",target);key.SetValue("DisplayIcon",exe);
      var uninstall=Path.Combine(target,"Uninstall Яндекс Музыка.exe");if(File.Exists(uninstall))key.SetValue("UninstallString","\""+uninstall+"\"");
    }
  }
  static int Main(string[] args) {
    try { return Run(args); } catch(Exception e) { Console.Error.WriteLine(e.Message);return 1; }
  }
  static int Run(string[] args) {
    string target=CheckedDirectory(Option(args,"target")),payload=CheckedDirectory(Option(args,"payload"));
    if(Same(target,payload)||target.StartsWith(payload+"\\",StringComparison.OrdinalIgnoreCase)||payload.StartsWith(target+"\\",StringComparison.OrdinalIgnoreCase))throw new Exception("Payload and installation must be separate");
    string exe=Path.Combine(target,"Яндекс Музыка.exe");
    if(!File.Exists(Path.Combine(payload,"Яндекс Музыка.exe")))throw new Exception("Music executable missing");
    var versionInfo=Json.Deserialize<Dictionary<string,object>>(File.ReadAllText(Path.Combine(payload,"mod-version.json"),Encoding.UTF8));
    string version=(string)versionInfo["version"];
    if(!System.Text.RegularExpressions.Regex.IsMatch(version,@"^\d+\.\d+\.\d+$"))throw new Exception("Invalid mod version");
    int parent=0;int.TryParse(Option(args,"parent","0"),out parent);
    if(parent>0){try{using(var p=Process.GetProcessById(parent)){if(Same(ProcessPath(p),exe)&&!p.WaitForExit(20000))throw new IOException("Music is still closing; retry the update");}}catch(ArgumentException){}}
    foreach(var p in Process.GetProcesses())using(p){if(!Same(ProcessPath(p),exe))continue;p.CloseMainWindow();if(!p.WaitForExit(5000)){p.Kill();p.WaitForExit(5000);}}
    // Enumerate and validate before changing installed files.
    string[] files=PayloadFiles(payload).ToArray();
    string backup=Path.Combine(target,".mod-backup-"+DateTime.UtcNow.ToString("yyyyMMdd-HHmmss")+"-"+Guid.NewGuid().ToString("N").Substring(0,8));
    Directory.CreateDirectory(backup);
    var journal=new List<Entry>();int copied=0,failAfter=int.Parse(Option(args,"fail-after","-1"));
    try{
      foreach(string file in files){
        string relative=file.Substring(payload.Length+1),destination=Path.GetFullPath(Path.Combine(target,relative));
        if(!destination.StartsWith(target+"\\",StringComparison.OrdinalIgnoreCase))throw new Exception("Invalid destination");
        CheckedDirectory(Path.GetDirectoryName(destination));
        if(File.Exists(destination)&&(File.GetAttributes(destination)&FileAttributes.ReparsePoint)!=0)throw new Exception("Reparse destination file");
        var entry=new Entry{path=destination,backup=Path.Combine(backup,relative),existed=File.Exists(destination)};
        if(entry.existed){Directory.CreateDirectory(Path.GetDirectoryName(entry.backup));File.Copy(destination,entry.backup,true);}
        journal.Add(entry);File.WriteAllText(Path.Combine(backup,"journal.json"),Json.Serialize(journal),Encoding.UTF8);
        Directory.CreateDirectory(Path.GetDirectoryName(destination));File.Copy(file,destination,true);copied++;
        if(failAfter>=0&&copied>=failAfter)throw new IOException("Simulated copy failure");
      }
      if(!Flag(args,"no-shell"))Integrate(target,exe,version);
      File.WriteAllText(Path.Combine(backup,"result.txt"),"complete",Encoding.UTF8);
    }catch(Exception error){
      try{
        for(int i=journal.Count-1;i>=0;i--){var entry=journal[i];if(entry.existed)File.Copy(entry.backup,entry.path,true);else if(File.Exists(entry.path))File.Delete(entry.path);}
        File.WriteAllText(Path.Combine(backup,"result.txt"),"rolled-back",Encoding.UTF8);
      }catch(Exception rollback){throw new IOException("Restore failed. Backup: "+backup+". "+rollback.Message,error);}
      throw;
    }
    if(!Flag(args,"no-launch"))Process.Start(new ProcessStartInfo(exe){WorkingDirectory=target,UseShellExecute=false});
    Console.WriteLine("Updated Music Mod to "+version+". Backup: "+backup);
    return 0;
  }
}
