"use client";

import { motion } from "framer-motion";
import styled from "styled-components";

const ProgressWrapper = styled.div`
  width: 100%;
  background: #F4F4F4;
  box-shadow: inset -1px 1px 2px rgba(200, 200, 200, 0.2),
              inset 1px -1px 2px rgba(200, 200, 200, 0.2),
              inset -1px -1px 2px rgba(255, 255, 255, 0.9),
              inset 1px 1px 3px rgba(200, 200, 200, 0.9);
  border-radius: 28px;
  overflow: hidden;
  height: 30px;
`;

const ProgressBar = styled(motion.div)`
  height: 100%;
  background: #00d100;
  border-radius: 28px;
  text-align: left;
  line-height: 30px;
  color: white;
  box-shadow: 0 0 10px rgba(0, 209, 0, 0.5);
  padding-left: 15px;
  white-space: nowrap;
`;

export function ProgressLoading() {
  return (
    <ProgressWrapper>
      <ProgressBar
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{
          duration: 3,
          ease: [0.4, 0, 0.2, 1],
          times: [0, 0.2, 0.5, 0.8, 1],
        }}
      >
        <span className="text-white font-medium text-sm">
          Enviando orçamento...
        </span>
      </ProgressBar>
    </ProgressWrapper>
  );
} 