.class public final Lru/yandex/music/mod/ModGlassBrush;
.super Lobs;

.field private final color:I
.field private final radius:F
.field private final original:Lobs;

.method public constructor <init>(ILjava/lang/Object;)V
    .locals 1
    const/4 v0, 0x0
    invoke-direct {p0, p1, p2, v0}, Lru/yandex/music/mod/ModGlassBrush;-><init>(ILjava/lang/Object;Lobs;)V
    return-void
.end method

.method public constructor <init>(ILjava/lang/Object;Lobs;)V
    .locals 1
    invoke-direct {p0}, Lobs;-><init>()V
    iput p1, p0, Lru/yandex/music/mod/ModGlassBrush;->color:I
    iput-object p3, p0, Lru/yandex/music/mod/ModGlassBrush;->original:Lobs;
    invoke-static {p2}, Lru/yandex/music/mod/ModGlass;->radius(Ljava/lang/Object;)F
    move-result v0
    iput v0, p0, Lru/yandex/music/mod/ModGlassBrush;->radius:F
    return-void
.end method

.method public static choose(JLd44;Lgcs;)Ld44;
    .locals 2
    invoke-static {p2, p3}, Lru/yandex/music/mod/ModGlass;->wrapGradient(Ljava/lang/Object;Ljava/lang/Object;)Z
    move-result v0
    if-eqz v0, :solid
    check-cast p2, Lobs;
    new-instance v1, Lru/yandex/music/mod/ModGlassBrush;
    const/4 v0, 0x0
    invoke-direct {v1, v0, p3, p2}, Lru/yandex/music/mod/ModGlassBrush;-><init>(ILjava/lang/Object;Lobs;)V
    return-object v1
    :solid
    invoke-static {p0, p1, p2, p3}, Lru/yandex/music/mod/ModGlass;->eligible(JLjava/lang/Object;Ljava/lang/Object;)I
    move-result v0
    if-eqz v0, :original
    new-instance v1, Lru/yandex/music/mod/ModGlassBrush;
    invoke-direct {v1, v0, p3}, Lru/yandex/music/mod/ModGlassBrush;-><init>(ILjava/lang/Object;)V
    return-object v1
    :original
    return-object p2
.end method

.method public final b(J)Landroid/graphics/Shader;
    .locals 2
    iget-object v0, p0, Lru/yandex/music/mod/ModGlassBrush;->original:Lobs;
    if-eqz v0, :solid
    invoke-virtual {v0, p1, p2}, Lobs;->b(J)Landroid/graphics/Shader;
    move-result-object v0
    iget v1, p0, Lru/yandex/music/mod/ModGlassBrush;->radius:F
    invoke-static {v0, v1, p1, p2}, Lru/yandex/music/mod/ModGlass;->overlay(Landroid/graphics/Shader;FJ)Landroid/graphics/Shader;
    move-result-object v0
    return-object v0
    :solid
    iget v0, p0, Lru/yandex/music/mod/ModGlassBrush;->color:I
    iget v1, p0, Lru/yandex/music/mod/ModGlassBrush;->radius:F
    invoke-static {v0, v1, p1, p2}, Lru/yandex/music/mod/ModGlass;->shader(IFJ)Landroid/graphics/Shader;
    move-result-object v0
    return-object v0
.end method

.method public final equals(Ljava/lang/Object;)Z
    .locals 3
    instance-of v0, p1, Lru/yandex/music/mod/ModGlassBrush;
    if-eqz v0, :different
    check-cast p1, Lru/yandex/music/mod/ModGlassBrush;
    iget-object v0, p0, Lru/yandex/music/mod/ModGlassBrush;->original:Lobs;
    iget-object v1, p1, Lru/yandex/music/mod/ModGlassBrush;->original:Lobs;
    invoke-static {v0, v1}, Ljava/util/Objects;->equals(Ljava/lang/Object;Ljava/lang/Object;)Z
    move-result v0
    if-eqz v0, :different
    iget v0, p0, Lru/yandex/music/mod/ModGlassBrush;->color:I
    iget v1, p1, Lru/yandex/music/mod/ModGlassBrush;->color:I
    if-ne v0, v1, :different
    iget v0, p0, Lru/yandex/music/mod/ModGlassBrush;->radius:F
    iget v1, p1, Lru/yandex/music/mod/ModGlassBrush;->radius:F
    invoke-static {v0}, Ljava/lang/Float;->floatToIntBits(F)I
    move-result v0
    invoke-static {v1}, Ljava/lang/Float;->floatToIntBits(F)I
    move-result v1
    if-ne v0, v1, :different
    const/4 v0, 0x1
    return v0
    :different
    const/4 v0, 0x0
    return v0
.end method

.method public final hashCode()I
    .locals 2
    iget v0, p0, Lru/yandex/music/mod/ModGlassBrush;->color:I
    iget v1, p0, Lru/yandex/music/mod/ModGlassBrush;->radius:F
    invoke-static {v1}, Ljava/lang/Float;->floatToIntBits(F)I
    move-result v1
    xor-int/2addr v0, v1
    iget-object v1, p0, Lru/yandex/music/mod/ModGlassBrush;->original:Lobs;
    invoke-static {v1}, Ljava/util/Objects;->hashCode(Ljava/lang/Object;)I
    move-result v1
    xor-int/2addr v0, v1
    return v0
.end method
