import { getDb } from '../db';

async function getCollection() {
  const database = await getDb();
  return database.collection('files');
}

export const Files = {
  async increment(file: { filename: string; size: number; thumbextension: string }) {
    const db = await getCollection();
    return db.updateOne({
      '_id': file.filename
    }, {
      '$inc': {
        'count': 1
      },
      '$addToSet': {
        'exts': file.thumbextension,
      },
      '$setOnInsert': {
        'size': file.size
      }
    }, {
      'upsert': true
    });
  },

  async decrement(fileNames: string[]) {
    const db = await getCollection();
    const fileCounts: Record<string, number> = fileNames.reduce((acc, f) => {
      acc[f] = (acc[f] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const commonCounts: Record<number, string[]> = Object.entries(fileCounts).reduce((acc, entry) => {
      const count = entry[1];
      const filename = entry[0];
      acc[count] = (acc[count] || []).concat(filename);
      return acc;
    }, {} as Record<number, string[]>);
    const bulkWrites = Object.entries(commonCounts).map(entry => ({
      'updateMany': {
        'filter': {
          '_id': {
            '$in': entry[1]
          }
        },
        'update': {
          '$inc': {
            'count': -Number(entry[0])
          }
        }
      }
    }));
    return db.bulkWrite(bulkWrites);
  },

  async activeContent() {
    const db = await getCollection();
    const result = await db.aggregate([
      {
        '$group': {
          '_id': null,
          'count': {
            '$sum': 1
          },
          'size': {
            '$sum': '$size'
          }
        }
      }
    ]).toArray();
    const stats = result[0];
    if (stats) {
      return {
        count: stats.count,
        totalSize: stats.size,
        totalSizeString: formatSize(stats.size)
      };
    } else {
      return {
        count: 0,
        totalSize: 0,
        totalSizeString: '0B'
      };
    }
  },

  async getUnreferenced(fileNames?: string[]) {
    const db = await getCollection();
    const query: any = {
      'count': {
        '$lte': 0
      }
    };
    if (fileNames) {
      query['_id'] = {
        '$in': fileNames
      };
    }
    return db.find(query, {
      'projection': {
        'count': 0,
        'size': 0
      }
    }).toArray();
  },

  async deleteMany(query: any) {
    const db = await getCollection();
    return db.deleteMany(query);
  }
};

function formatSize(bytes: number): string {
  if (bytes === 0) return '0B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + sizes[i];
}
