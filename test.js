class Settlement {

  save(entityInstance, options = {}) {
    console.log({entityInstance})
    return entityInstance;
  }


  settleTargetWallet(
    settlementKey,
    targetWallet,
    deficitAmount,
    settlers,
    currentSettlerIndex,
    options,
  ) {
    if (deficitAmount <= 0) {
      return this.save({ ...targetWallet }, options);
    }

    const settler = settlers[currentSettlerIndex];

    if (targetWallet.id == settler.id) {
      return this.settleTargetWallet(
        settlementKey,
        targetWallet,
        deficitAmount,
        settlers,
        currentSettlerIndex + 1,
        options,
      );
    }

    const settlerContribution = settler.balance < deficitAmount ? settler.balance : deficitAmount;

    targetWallet.balance = targetWallet.balance + settlerContribution;

    console.log({settlerContribution})
    console.log({ targetBalance: targetWallet.balance });

    this.save(
      {
        ...settler,
        balance: settler.balance - settlerContribution,
      },
      options,
    );

    const newDeficitAmount = deficitAmount - settlerContribution;

    return this.settleTargetWallet(
      settlementKey,
      targetWallet,
      newDeficitAmount,
      settlers,
      currentSettlerIndex + 1,
      options,
    );
  }
}

const wallets = [
  {
    id: '1234',
    balance: 40,
    userId: 'odogwu1',
    blockchain: 'SOL',
    currency: 'USDT',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '1235',
    balance: 20.334,
    userId: 'odogwu1',
    blockchain: 'BSC',
    currency: 'USDT',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '1236',
    balance: 13.0267,
    userId: 'odogwu1',
    blockchain: 'ETH',
    currency: 'USDT',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '1237',
    balance: 0,
    userId: 'odogwu1',
    blockchain: 'MATIC',
    currency: 'USDT',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const sum  = wallets.reduce((prev, wallet) => {
  return prev + wallet.balance;
}, 0);

console.log({sum})

const settlement = new Settlement();

const amountToWithdraw = 13.3065;
const targetWallet = wallets[1];
const deficitAmount = amountToWithdraw - targetWallet.balance;

if (amountToWithdraw > sum) {
  // throw new Error('Insufficient funds');
}

// console.log({deficitAmount})


const deductibleWallet = settlement.settleTargetWallet(
  'safesapce',
  targetWallet,
  deficitAmount,
  wallets,
  0,
  {}
)

console.log({deductibleWallet})
// console.log({wallets})