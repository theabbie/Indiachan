import { getDb, ObjectId } from '../db';

async function getCollection() {
  const database = await getDb();
  return database.collection('modlogs');
}

export const Modlogs = {
  async getDates(board: string, publicOnly: boolean = true) {
    const db = await getCollection();
    return db.aggregate([
      {
        '$match': {
          ...(publicOnly ? { 'public': true } : {}),
          'board': board
        }
      },
      {
        '$project': {
          'year': {
            '$year': '$date'
          },
          'month': {
            '$month': '$date'
          },
          'day': {
            '$dayOfMonth': '$date'
          }
        }
      },
      {
        '$group': {
          '_id': {
            'year': '$year',
            'month': '$month',
            'day': '$day',
          },
          'count': {
            '$sum': 1
          }
        }
      },
      {
        '$project': {
          '_id': 0,
          'date': '$_id',
          'count': '$count'
        }
      },
      {
        '$sort': {
          'date.year': -1,
          'date.month': -1,
          'date.day': -1
        }
      },
    ]).toArray();
  },

  async find(filter: any, offset: number, limit: number) {
    const db = await getCollection();
    return db.find(filter)
      .skip(offset)
      .limit(limit)
      .sort({
        '_id': -1
      })
      .toArray();
  },

  async count(filter: any) {
    const db = await getCollection();
    return db.countDocuments(filter);
  },

  async findBetweenDate(board: any, start: Date, end: Date, publicOnly: boolean = true) {
    const db = await getCollection();
    const startDate = ObjectId.createFromTime(Math.floor(start.getTime()/1000));
    const endDate = ObjectId.createFromTime(Math.floor(end.getTime()/1000));
    return db.find({
      '_id': {
        '$gte': startDate,
        '$lte': endDate
      },
      'board': board._id,
      ...(publicOnly ? { 'public': true } : {}),
    }, {
      projection: {
        'ip': 0,
      }
    }).sort({
      '_id': -1
    }).toArray();
  },

  async deleteOld(board: string, date: Date) {
    const db = await getCollection();
    const monthOld = ObjectId.createFromTime(Math.floor(date.getTime()/1000));
    return db.deleteMany({
      '_id': {
        '$lt': monthOld,
      },
      'board': board,
    });
  },

  async insertOne(event: any) {
    const db = await getCollection();
    return db.insertOne(event);
  },

  async insertMany(events: any[]) {
    const db = await getCollection();
    return db.insertMany(events);
  },

  async deleteBoard(board: string) {
    const db = await getCollection();
    return db.deleteMany({
      'board': board
    });
  },

  async deleteAll() {
    const db = await getCollection();
    return db.deleteMany({});
  },
};
