'use strict';

const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const { Role } = require("../../app/models");

const names = [
  "Johnny",
  "Fikri",
  "Brian",
  "Ranggawarsita",
  "Jayabaya",
]

const nameAdmin = [
  "Admin",
  "Owner",
  "Imam Ganteng"
]

module.exports = {
  async up (queryInterface, Sequelize) {
    const password = "123456";
    const encryptedPassword = bcrypt.hashSync(password, 10);
    const timestamp = new Date();

    const roleCus = await Role.findOne({
      where: {
        name: "CUSTOMER",
      }
    })

    const roleAdmin = await Role.findOne({
      where: {
        name: "ADMIN",
      }
    })

    const users = names.map((name) => ({
      name,
      email: `${name.toLowerCase()}@binar.co.id`,
      encryptedPassword,
      roleId: roleCus.id, 
      createdAt: timestamp,
      updatedAt: timestamp,
    }))

    const admin = nameAdmin.map((name) => ({
      name,
      email: `${name.toLowerCase()}@binar.co.id`,
      encryptedPassword,
      roleId: roleAdmin.id, 
      createdAt: timestamp,
      updatedAt: timestamp,
    }))

    console.log(users, admin)
    console.log(typeof(users))
    const account = [...users, ...admin]
    await queryInterface.bulkInsert('Users', account, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', { name: { [Op.in]: names } }, {});
  }
};
