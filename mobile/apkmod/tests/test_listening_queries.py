"""Exercise the production SQLite schema/aggregate SQL without touching phone data."""
import json
from pathlib import Path
import re
import sqlite3
import unittest

SOURCE = (Path(__file__).resolve().parents[1] / 'src/ru/yandex/music/mod/ModListening.java').read_text(encoding='utf-8')


class JournalQueries(unittest.TestCase):
    def setUp(self):
        self.db = sqlite3.connect(':memory:')
        for sql in re.findall(r'd\.execSQL\("(CREATE [^"\n]+)"\)', SOURCE):
            self.db.execute(json.loads('"' + sql + '"'))

    def tearDown(self):
        self.db.close()

    def play(self, key, start, title, artist, listened):
        self.db.execute('INSERT INTO plays VALUES(?,?,?,?,?,?,?,?,?,?)',
                        (key, start, title, str(key), title, artist, 'Альбом', (title + '\n' + artist).lower(), listened, 'interrupted'))

    def aggregate(self, name, start, end):
        sql = re.search(r's\.' + name + r' = scalar\(d, "([^"]+)"', SOURCE)[1]
        return self.db.execute(sql, (start, end)).fetchone()[0]

    def test_midnight_and_period_sums(self):
        self.play(1, 0, 'Песня', 'Артист', 20_000)
        self.db.executemany('INSERT INTO minutes VALUES(?,?,?)', [(1, 0, 12_000), (1, 60_000, 8_000)])
        self.assertEqual(self.aggregate('millis', 0, 60_000), 12_000)
        self.assertEqual(self.aggregate('millis', 60_000, 120_000), 8_000)
        self.assertEqual(self.aggregate('millis', 0, 120_000), 20_000)

    def test_discoveries_are_first_observations_not_replays(self):
        self.play(1, 10, 'Один', 'Старый', 40_000)
        self.play(2, 110, 'Два', 'Старый', 40_000)
        self.play(3, 120, 'Три', 'Новый', 40_000)
        self.play(4, 130, 'Четыре', 'Коротко', 5_000)
        self.db.executemany('INSERT INTO minutes VALUES(?,?,?)', [(1, 0, 40_000), (2, 100, 40_000), (3, 100, 40_000), (4, 100, 5_000)])
        self.assertEqual(self.aggregate('discoveries', 100, 200), 1)
        self.assertEqual(self.aggregate('plays', 100, 200), 2)
        self.assertEqual(self.aggregate('artists', 100, 200), 2)

    def test_track_started_before_midnight_still_counts_today(self):
        self.play(1, 10, 'Длинная', 'Артист', 40_000)
        self.db.executemany('INSERT INTO minutes VALUES(?,?,?)', [(1, 0, 20_000), (1, 60_000, 20_000)])
        self.assertEqual(self.aggregate('plays', 60_000, 120_000), 1)
        self.assertEqual(self.aggregate('artists', 60_000, 120_000), 1)

    def test_cyrillic_and_literal_search_wildcards(self):
        self.play(1, 0, 'ПЕСНЯ_100%', 'Артист', 1000)
        self.play(2, 1, 'ПесняX100другая', 'Артист', 1000)
        query = 'ПЕСНЯ_100%'.lower().replace('\\', '\\\\').replace('%', '\\%').replace('_', '\\_')
        self.assertEqual(self.db.execute("SELECT id FROM plays WHERE search LIKE ? ESCAPE '\\'", ('%' + query + '%',)).fetchall(), [(1,)])

    def test_clear_keeps_schema_and_does_not_affect_other_data(self):
        self.play(1, 0, 'Один', 'Артист', 1000)
        self.db.execute('INSERT INTO minutes VALUES(1,0,1000)')
        self.db.execute('DELETE FROM minutes')
        self.db.execute('DELETE FROM plays')
        self.assertEqual(self.aggregate('millis', 0, 60_000), 0)
        self.play(2, 60_000, 'Два', 'Артист', 1000)
        self.assertEqual(self.db.execute('SELECT count(*) FROM plays').fetchone()[0], 1)


if __name__ == '__main__':
    unittest.main()
