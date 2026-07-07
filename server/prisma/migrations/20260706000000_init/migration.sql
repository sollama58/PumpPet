-- CreateTable
CREATE TABLE "Wallet" (
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "tokenInMint" TEXT NOT NULL,
    "tokenInAmount" DOUBLE PRECISION NOT NULL,
    "tokenInSymbol" TEXT,
    "tokenOutMint" TEXT NOT NULL,
    "tokenOutAmount" DOUBLE PRECISION NOT NULL,
    "tokenOutSymbol" TEXT,
    "usdValueIn" DOUBLE PRECISION NOT NULL,
    "usdValueOut" DOUBLE PRECISION NOT NULL,
    "costBasisUsd" DOUBLE PRECISION,
    "realizedPnlUsd" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trade_signature_key" ON "Trade"("signature");

-- CreateIndex
CREATE INDEX "Trade_walletAddress_timestamp_idx" ON "Trade"("walletAddress", "timestamp");

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_walletAddress_fkey"
    FOREIGN KEY ("walletAddress") REFERENCES "Wallet"("address")
    ON DELETE RESTRICT ON UPDATE CASCADE;
