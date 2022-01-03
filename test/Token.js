const { ethers } = require("hardhat");
const { expect } = require("chai");

function addDecimals(qty) {
  return ethers.BigNumber.from(qty).mul(ethers.BigNumber.from(10).pow(18));
}

describe("Token", function () {
  it("Deployment should assign the total supply of tokens to the owner", async function () {
    const [owner] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const hardhatToken = await Token.deploy();

    const ownerBalance = await hardhatToken.balanceOf(owner.address);
    expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
  });

  it("Should be able to send tokens to wallet", async function () {
    const [owner, wallet1] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const hardhatToken = await Token.deploy();

    const totalSupply = await hardhatToken.totalSupply();
    await hardhatToken.transfer(wallet1.address, addDecimals(100));

    const wallet1Balance = await hardhatToken.balanceOf(wallet1.address);
    const ownerBalance = await hardhatToken.balanceOf(owner.address);
    expect(addDecimals(100)).to.equal(wallet1Balance);
    expect(totalSupply.sub(addDecimals(100))).to.equal(ownerBalance);
  });

  it("Should be able to burn tokens", async function () {
    const [owner, wallet1] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const hardhatToken = await Token.deploy();

    const totalSupply = await hardhatToken.totalSupply();
    await hardhatToken.transfer(wallet1.address, addDecimals(100));
    await hardhatToken.burn(addDecimals(100));

    const wallet1Balance = await hardhatToken.balanceOf(wallet1.address);
    const ownerBalance = await hardhatToken.balanceOf(owner.address);
    expect(totalSupply.sub(addDecimals(200))).to.equal(ownerBalance);
    expect(addDecimals(100)).to.equal(wallet1Balance); // Ensure that other wallets were not effected
  });

  it("Should be able to send tokens in a batch", async function () {
    const [owner, wallet1, wallet2, wallet3] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const hardhatToken = await Token.deploy();

    const totalSupply = await hardhatToken.totalSupply();
    await hardhatToken.sendBatch([wallet1.address, wallet2.address], addDecimals(100));

    const wallet1Balance = await hardhatToken.balanceOf(wallet1.address);
    const wallet2Balance = await hardhatToken.balanceOf(wallet2.address);
    const wallet3Balance = await hardhatToken.balanceOf(wallet3.address);
    const ownerBalance = await hardhatToken.balanceOf(owner.address);
    expect(totalSupply.sub(addDecimals(200))).to.equal(ownerBalance);
    expect(addDecimals(100)).to.equal(wallet1Balance); // Ensure that other wallets were not effected
    expect(addDecimals(100)).to.equal(wallet2Balance); // Ensure that other wallets were not effected
    expect(0).to.equal(wallet3Balance); // Ensure that other wallets were not effected
  });

  it("Should not be able to send more tokens than available in a batch", async function () {
    const chai = require("chai");
    const chaiAsPromised = require("chai-as-promised");
    chai.use(chaiAsPromised);

    const [owner, wallet1, wallet2, wallet3] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const hardhatToken = await Token.deploy();

    const totalSupply = await hardhatToken.totalSupply();
    return await expect(
        hardhatToken.sendBatch([wallet1.address, wallet2.address, wallet3.address], totalSupply.div(2))
    ).to.be.rejectedWith('BEP20: transfer amount exceeds balance');
  });
});
