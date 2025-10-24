import { getDb, Binary } from '../db';
import bcrypt from 'bcrypt';

async function getCollection() {
  const database = await getDb();
  return database.collection('accounts');
}

export const Accounts = {
  async findOne(username: string) {
    const db = await getCollection();
    const account = await db.findOne({ '_id': username });
    if (account != null && account.permissions) {
      account.permissions = account.permissions.toString('base64');
    }
    return account;
  },

  async insertOne(original: string, username: string, password: string | null, permissions: any, web3: boolean = false) {
    const db = await getCollection();
    let passwordHash;
    if (password) {
      passwordHash = await bcrypt.hash(password, 12);
    }
    return db.insertOne({
      '_id': username,
      original,
      passwordHash,
      'permissions': Binary.createFromBase64(permissions),
      'ownedBoards': [],
      'staffBoards': [],
      'twofactor': null,
      web3,
      'lastActiveDate': new Date()
    });
  },

  async changePassword(username: string, newPassword: string) {
    const db = await getCollection();
    const passwordHash = await bcrypt.hash(newPassword, 12);
    return db.updateOne({ '_id': username }, {
      '$set': {
        'passwordHash': passwordHash
      }
    });
  },

  async updateLastActiveDate(username: string) {
    const db = await getCollection();
    return db.updateOne({ '_id': username }, {
      '$set': {
        'lastActiveDate': new Date()
      }
    });
  },

  async updateTwofactor(username: string, secret: string | null) {
    const db = await getCollection();
    return db.updateOne({ '_id': username }, {
      '$set': {
        'twofactor': secret
      }
    });
  },

  async getInactive(duration: number) {
    const db = await getCollection();
    return db.find({
      'lastActiveDate': {
        '$lt': new Date(Date.now() - duration)
      }
    }).toArray();
  },

  async deleteMany(usernames: string[]) {
    const db = await getCollection();
    return db.deleteMany({
      '_id': {
        '$in': usernames
      }
    });
  },

  async clearStaffAndOwnedBoards(usernames: string[]) {
    const db = await getCollection();
    return db.updateMany({
      '_id': {
        '$in': usernames
      }
    }, {
      '$set': {
        'staffBoards': [],
        'ownedBoards': [],
      }
    });
  },

  async addOwnedBoard(username: string, boardUri: string) {
    const db = await getCollection();
    return db.updateOne({ '_id': username }, {
      '$push': {
        'ownedBoards': boardUri
      }
    });
  },

  async addStaffBoard(username: string, boardUri: string) {
    const db = await getCollection();
    return db.updateOne({ '_id': username }, {
      '$push': {
        'staffBoards': boardUri
      }
    });
  },

  async removeStaffBoard(usernames: string[], boardUri: string) {
    const db = await getCollection();
    return db.updateMany({
      '_id': {
        '$in': usernames
      }
    }, {
      '$pull': {
        'staffBoards': boardUri
      }
    });
  },

  async updatePassword(username: string, passwordHash: string) {
    const db = await getCollection();
    return db.updateOne({
      '_id': username
    }, {
      '$set': {
        'passwordHash': passwordHash
      }
    });
  }
};
