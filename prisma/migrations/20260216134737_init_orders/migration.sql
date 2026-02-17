-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "public_token" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "brl_gross" DECIMAL(65,30) NOT NULL,
    "fee_pct" DECIMAL(65,30) NOT NULL,
    "fee_brl" DECIMAL(65,30) NOT NULL,
    "brl_net" DECIMAL(65,30) NOT NULL,
    "usd_tourism_rate" DECIMAL(65,30) NOT NULL,
    "receive_usdt" DECIMAL(65,30),
    "receive_btc" DECIMAL(65,30),
    "status" TEXT NOT NULL DEFAULT 'new',
    "tx_hash" TEXT,
    "tx_network" TEXT,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_public_token_key" ON "orders"("public_token");
