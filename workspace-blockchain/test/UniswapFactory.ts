import { should } from 'chai';
import { TestTokenInstance } from '../types/truffle-contracts';
import { UniswapFactoryInstance } from '../types/truffle-contracts';

const TestToken = artifacts.require('./TestToken.sol') as Truffle.Contract<TestTokenInstance>;
const UniswapFactory = artifacts.require('./UniswapFactory.sol') as Truffle.Contract<UniswapFactoryInstance>;
should();

/** @test {UniswapFactory} contract */
contract('UniswapFactory - launchExchange', (accounts) => {
    /**
     * @test {UniswapFactory#launchExchange}
     */
    it('Launch an exchange for test token.', async () => {
        const token = await TestToken.new('TestToken', 'TST', 18);
        const uniswapFactory = await UniswapFactory.new();
        const launchEvent = (await uniswapFactory.launchExchange(token.address)).logs[0];
        launchEvent.event.should.be.equal('ExchangeLaunch');
        launchEvent.args.token.should.be.equal(token.address);
    });
});

/** @test {UniswapFactory} contract */
contract('UniswapFactory - view methods', (accounts) => {
    let token: TestTokenInstance;
    let uniswapFactory: UniswapFactoryInstance;

    beforeEach(async () => {
        token = await TestToken.new('TestToken', 'TST', 18);
        uniswapFactory = await UniswapFactory.new();
        await uniswapFactory.launchExchange(token.address)
    });

    // function tokenToExchangeLookup(address _token) public view returns (address payable exchange);
    // function exchangeToTokenLookup(address _exchange) public view returns (address token);

    /**
     * @test {UniswapFactory#getExchangeCount}
     */
    it('getExchangeCount.', async () => {
        (await uniswapFactory.getExchangeCount()).toNumber().should.be.equal(1);
    });

    /**
     * @test {UniswapFactory#tokenToExchangeLookup} and {UniswapFactory#exchangeToTokenLookup}
     */
    it('address lookups.', async () => {
        const emptyAddress = '0x0000000000000000000000000000000000000000';
        const mockAddress = '0x0000000000000000000000000000000000000001';

        const exchangeAddress = (await uniswapFactory.tokenToExchangeLookup(token.address));
        exchangeAddress.should.be.not.equal(emptyAddress);
        const tokenAddress = (await uniswapFactory.exchangeToTokenLookup(exchangeAddress));
        tokenAddress.should.be.equal(token.address);

        const noExchangeAddress = (await uniswapFactory.tokenToExchangeLookup(mockAddress));
        noExchangeAddress.should.be.equal(emptyAddress);
        const noTokenAddress = (await uniswapFactory.exchangeToTokenLookup(mockAddress));
        noTokenAddress.should.be.equal(emptyAddress);
    });
});
