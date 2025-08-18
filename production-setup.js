#!/usr/bin/env node

/**
 * Production Setup Script for Vercel Deployment
 * Bu script Vercel deployment sonrası çalışacak ve temel verileri oluşturacak
 */

const { config } = require('dotenv');
config();

const mysql = require('mysql2/promise');

async function setupProductionDatabase() {
  let connection;
  
  try {
    console.log('🚀 Production database setup başlatılıyor...');
    
    // Veritabanı bağlantısı
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      port: parseInt(process.env.DB_PORT),
      charset: 'utf8mb4',
      timezone: '+03:00',
    });
    
    console.log('✅ Veritabanı bağlantısı başarılı');
    
    // 1. Tabloları kontrol et ve oluştur
    const tables = [
      `CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` varchar(191) PRIMARY KEY,
        \`username\` varchar(50) NOT NULL UNIQUE,
        \`email\` varchar(255) NOT NULL UNIQUE,
        \`password\` varchar(255) NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`company_name\` varchar(255) NOT NULL,
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
        \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        UNIQUE KEY \`username_idx\` (\`username\`),
        UNIQUE KEY \`email_idx\` (\`email\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      
      `CREATE TABLE IF NOT EXISTS \`currencies\` (
        \`id\` varchar(191) PRIMARY KEY,
        \`code\` varchar(10) NOT NULL UNIQUE,
        \`name\` varchar(100) NOT NULL,
        \`symbol\` varchar(10) NOT NULL,
        \`is_active\` boolean DEFAULT true NOT NULL,
        UNIQUE KEY \`code_idx\` (\`code\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      
      `CREATE TABLE IF NOT EXISTS \`categories\` (
        \`id\` varchar(191) PRIMARY KEY,
        \`name\` varchar(255) NOT NULL,
        \`type\` enum('income', 'expense') NOT NULL,
        \`color\` varchar(7) NOT NULL,
        \`is_default\` boolean DEFAULT false NOT NULL,
        \`user_id\` varchar(191) NOT NULL,
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
        KEY \`user_id_idx\` (\`user_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      
      `CREATE TABLE IF NOT EXISTS \`company_settings\` (
        \`id\` varchar(191) PRIMARY KEY,
        \`company_name\` varchar(255) NOT NULL,
        \`address\` text NOT NULL,
        \`phone\` varchar(50) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`website\` varchar(255),
        \`tax_number\` varchar(50),
        \`light_mode_logo\` longtext,
        \`dark_mode_logo\` longtext,
        \`quote_logo\` longtext,
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
        \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    ];
    
    for (const table of tables) {
      await connection.execute(table);
    }
    
    console.log('✅ Temel tablolar oluşturuldu');
    
    // 2. Default currencies ekle
    const currencyCheck = await connection.execute('SELECT COUNT(*) as count FROM `currencies`');
    if (currencyCheck[0][0].count === 0) {
      const currencies = [
        ['1', 'TRY', 'Türk Lirası', '₺', 1],
        ['2', 'USD', 'US Dollar', '$', 1],
        ['3', 'EUR', 'Euro', '€', 1],
        ['4', 'GBP', 'British Pound', '£', 1],
      ];
      
      await connection.execute(
        'INSERT INTO `currencies` (`id`, `code`, `name`, `symbol`, `is_active`) VALUES ?',
        [currencies]
      );
      
      console.log('✅ Default para birimleri eklendi');
    }
    
    // 3. Default company settings ekle
    const companyCheck = await connection.execute('SELECT COUNT(*) as count FROM `company_settings`');
    if (companyCheck[0][0].count === 0) {
      await connection.execute(
        `INSERT INTO \`company_settings\` 
         (\`id\`, \`company_name\`, \`address\`, \`phone\`, \`email\`, \`website\`, \`tax_number\`) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['1', 'CALAF.CO', 'İstanbul, Türkiye', '+90 212 555 0000', 'info@calaf.co', 'www.calaf.co', '']
      );
      
      console.log('✅ Default firma ayarları eklendi');
    }
    
    console.log('🎉 Production database setup tamamlandı!');
    
  } catch (error) {
    console.error('❌ Setup hatası:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Script çalıştır
if (require.main === module) {
  setupProductionDatabase();
}

module.exports = { setupProductionDatabase };
