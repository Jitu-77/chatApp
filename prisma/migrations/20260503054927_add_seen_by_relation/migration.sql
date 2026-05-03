-- CreateTable
CREATE TABLE "_SeenMessages" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_SeenMessages_AB_unique" ON "_SeenMessages"("A", "B");

-- CreateIndex
CREATE INDEX "_SeenMessages_B_index" ON "_SeenMessages"("B");

-- AddForeignKey
ALTER TABLE "_SeenMessages" ADD CONSTRAINT "_SeenMessages_A_fkey" FOREIGN KEY ("A") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SeenMessages" ADD CONSTRAINT "_SeenMessages_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
