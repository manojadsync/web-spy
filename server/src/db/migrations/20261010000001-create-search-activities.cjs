'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('search_activities', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      domain: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      query: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      engine: {
        type: Sequelize.STRING,
        defaultValue: 'Google',
        allowNull: true,
      },
      ip_address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      timestamp: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('search_activities', ['user_id']);
    await queryInterface.addIndex('search_activities', ['domain']);
    await queryInterface.addIndex('search_activities', ['timestamp']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('search_activities');
  },
};
