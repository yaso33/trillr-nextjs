import { AnimatePresence, motion } from 'framer-motion'
import { MessageSquare } from 'lucide-react'
import React, { useState } from 'react'

export default function Tino() {
  const [open, setOpen] = useState(false)
  const [typing, setTyping] = useState(false)

  return (
    <div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { type: 'spring', stiffness: 300, damping: 30 },
            }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            className="fixed right-6 bottom-24 w-80 glass-sidebar rounded-[12px] p-4 z-50"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-[rgb(255,107,0)] flex items-center justify-center text-black font-bold">
                T
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">Tino — Assistant</div>
                <div className="text-xs text-foreground/70 mt-1">How can I help you today?</div>
                <div className="mt-3">
                  <div className="h-10 bg-[rgba(255,255,255,0.02)] rounded px-3 flex items-center">
                    <input
                      className="bg-transparent w-full outline-none text-sm"
                      placeholder="Ask Tino..."
                      onFocus={() => setTyping(true)}
                      onBlur={() => setTyping(false)}
                    />
                    <div className="ml-2">
                      <button className="px-2 py-1 rounded bg-[rgb(255,107,0)] text-black text-sm">
                        Send
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div
                      className={`h-3 w-16 rounded-full bg-[rgba(255,107,0,0.4)] animate-pulse-slow ${typing ? 'opacity-100' : 'opacity-50'}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        className="fixed right-6 bottom-6 z-50 h-14 w-14 rounded-full bg-[rgb(255,107,0)] shadow-lg flex items-center justify-center text-black"
        aria-label="Tino assistant"
      >
        <MessageSquare className="h-6 w-6" />
      </motion.button>
    </div>
  )
}
