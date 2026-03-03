import React from "react";
import { motion } from "framer-motion";
import VillageImage from '../assets/village.png';
import './CreateUser.css';

const text = "Welcome to Girinestham";

function CreateUser() {
  return (
    <div className="create-user-container">
      
      {/* Village Background */}
      <motion.div
        className="village-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <img src={VillageImage} alt="Village Scene" className="village-img" />
      </motion.div>

      {/* Birds flying */}
      <motion.div
        className="birds"
        animate={{ x: ["-10%", "110%"] }}
        transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
      >
        🕊️ 🕊️ 🕊️
      </motion.div>

      {/* Animated Welcome Text */}
      <motion.h1
        className="animated-text"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {text.split("").map((letter, index) => (
          <motion.span
            key={index}
            className="letter"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 500 }}
          >
            {letter}
          </motion.span>
        ))}
      </motion.h1>
    </div>
  );
}

export default CreateUser;
