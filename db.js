const Sequelize = require('sequelize');
const { INTEGER, VIRTUAL, STRING, UUID, UUIDV4 } = Sequelize;
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/the_acme_gaming_db');
const redis = require('redis');
const client = redis.createClient();

const User = conn.define('user', {
  name: STRING,
  id: {
    type: UUID,
    defaultValue: UUIDV4,
    primaryKey: true
  }
});

const Game = conn.define('game', {
  name: STRING,
  id: {
    type: UUID,
    defaultValue: UUIDV4,
    primaryKey: true
  },
  key: {
    type: VIRTUAL,
    get: function(){
      return `Game-Total-${ this.id }`;
    }
  }
});

Game.prototype.totalPoints = async function(){
  return new Promise((res, rej)=> {
    try {
      client.get(this.key, (err, result)=> {
        if(err){
          rej(err);
        }
        else{
          res(result*1);
        }
      });

    }
    catch(ex){
      rej(ex);
    }
  });
  /*
  const points = await conn.models.point.findAll({
    include: [
      {
        model: conn.models.player,
        where: {
          gameId: this.id
        }
      }
    ]
  });
  return points.reduce((acc, point)=> acc += point.value, 0);
  */
}

const Player = conn.define('player', {
  id: {
    type: UUID,
    defaultValue: UUIDV4,
    primaryKey: true
  }
});

const Point = conn.define('point', {
  id: {
    type: UUID,
    defaultValue: UUIDV4,
    primaryKey: true
  },
  value: {
    type: INTEGER
  }
});

Point.addHook('afterSave', async(point)=> {
  const player = await (
    conn.models.player.findByPk(point.playerId)
  );
  const game = await conn.models.game.findByPk(player.gameId);
  return new Promise((res, rej)=> {
    try {
      client.incrby(game.key, point.value, (err)=> {
        if(err){
          rej(err);
        }
        else {
          res();
        }
      });
    }
    catch(ex){
      rej(ex);
    }
  });
  /*
  game.total += point.value;
  await game.save();
  */
});

Player.belongsTo(User);
Player.belongsTo(Game);
Point.belongsTo(Player);

const syncAndSeed = async()=> {
  await new Promise((res, rej)=> {
    try {
      client.flushdb((err)=> {
        if(err){
          rej(err);
        }
        else {
          res();
        }
      });
    }
    catch(ex){
      rej(ex);
    }
  });
  await conn.sync({ force: true });
  const users = ['moe', 'lucy', 'larry'].map( name => User.create({ name }));
  const games = [1, 2, 3].map( num => Game.create({ name: `Game-${num}` }));
  const [
    [
      moe, lucy, larry
    ],
    [
      game1, game2, game3
    ]
  ] = await Promise.all([Promise.all(users), Promise.all(games)]);

  const [moe2, lucy2, larry2, moe1] = await Promise.all([
    Player.create({ userId: moe.id, gameId: game2.id }),
    Player.create({ userId: lucy.id, gameId: game2.id }),
    Player.create({ userId: larry.id, gameId: game2.id }),
    Player.create({ userId: moe.id, gameId: game1.id }),
  ]);

  await Promise.all([
    Point.create({ playerId: moe2.id, value: 1}),
    Point.create({ playerId: moe2.id, value: 2}),
    Point.create({ playerId: moe2.id, value: 5}),
    Point.create({ playerId: lucy2.id, value: 9}),
    Point.create({ playerId: lucy2.id, value: 2}),
    Point.create({ playerId: larry2.id, value: 10}),
    Point.create({ playerId: moe1.id, value: 100}),
  ]);

  return Game.findByPk(game2.id);
};

module.exports = {
  syncAndSeed
};
