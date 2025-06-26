-- create the database
CREATE DATABASE IF NOT EXISTS pokemon_db;

-- Switching to the newly created database
USE pokemon_db;

-- Create each table in the database
CREATE TABLE IF NOT EXISTS pokemon (
    id INT PRIMARY KEY AUTO_INCREMENT,
    Num INT NOT NULL,
    Name VARCHAR(50) NOT NULL,
    Type1 VARCHAR(50) NOT NULL,
    Type2 VARCHAR(50),
    Total INT NOT NULL,
    HP INT NOT NULL,
    Attack INT NOT NULL,
    Defense INT NOT NULL,
    SpAttack INT NOT NULL,
    SpDefense INT NOT NULL,
    Speed INT NOT NULL,
    Generation INT NOT NULL,
    Legendary BOOLEAN NOT NULL
);

