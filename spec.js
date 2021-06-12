const { expect } = require('chai');
const { syncAndSeed } = require('./db');

describe('a game', ()=> {
  let game2;
  beforeEach(async()=> {
    game2 = await syncAndSeed();
  });
  it('game2 exists', ()=> {
    expect(game2).to.be.ok;
  });
  describe('totalPoints', ()=> {
    it('adds up all points for a game', async()=> {
      expect(await game2.totalPoints()).to.equal(29);
    });
    it('adds up all points for a game', async()=> {
      expect(await game2.totalPoints()).to.equal(29);
    });
    it('adds up all points for a game', async()=> {
      expect(await game2.totalPoints()).to.equal(29);
    });
  });
  /*
  describe('total', ()=> {
    it('adds up all points for a game', async()=> {
      expect(game2.total).to.equal(29);
    });
    it('adds up all points for a game', async()=> {
      expect(game2.total).to.equal(29);
    });
    it('adds up all points for a game', async()=> {
      expect(game2.total).to.equal(29);
    });
    it('adds up all points for a game', async()=> {
      expect(game2.total).to.equal(29);
    });
  });
  */
});
