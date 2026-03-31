"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface Treasure {
  id: string;
  name: string;
  image: string;
  rotation: number;
}

export function TreasureCard({
  treasure,
  index,
}: {
  treasure: Treasure;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <Link href={`/treasure/${treasure.id}`}>
        <motion.div
          className="treasure-card push-pin cursor-pointer rounded-sm"
          style={
            { "--rotation": `${treasure.rotation}deg` } as React.CSSProperties
          }
          whileHover={{ y: -6, scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          animate={{ rotate: treasure.rotation }}
        >
          <div className="aspect-square overflow-hidden rounded-sm bg-gray-100">
            <img
              src={treasure.image}
              alt={treasure.name}
              className="h-full w-full object-cover"
            />
          </div>
          <p
            className="mt-2 text-center text-sm font-bold leading-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {treasure.name}
          </p>
        </motion.div>
      </Link>
    </motion.div>
  );
}
