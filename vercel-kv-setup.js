#!/usr/bin/env node

/**
 * Vercel KV Setup Script
 * Bu script production deployment sonrası çalışacak ve temel verileri oluşturacak
 */

console.log('🚀 Vercel KV setup başlatılıyor...');

// KV bağlantısını test et
async function testKVConnection() {
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      console.log('✅ Vercel KV environment variables mevcut');
      console.log('📊 KV URL:', process.env.KV_REST_API_URL.substring(0, 50) + '...');
      return true;
    } else {
      console.log('⚠️  Vercel KV environment variables eksik');
      console.log('💡 Vercel Dashboard > Storage > Create KV Database yapın');
      return false;
    }
  } catch (error) {
    console.error('❌ KV setup hatası:', error);
    return false;
  }
}

// Default data setup
async function setupDefaultData() {
  try {
    const { kv } = await import('@vercel/kv');
    
    // Test ping
    await kv.set('setup_test', 'success');
    const result = await kv.get('setup_test');
    
    if (result === 'success') {
      console.log('✅ Vercel KV bağlantısı başarılı');
      
      // Currencies setup
      const currencies = await kv.get('currencies');
      if (!currencies) {
        const defaultCurrencies = [
          { id: '1', code: 'TRY', name: 'Türk Lirası', symbol: '₺', isActive: true },
          { id: '2', code: 'USD', name: 'US Dollar', symbol: '$', isActive: true },
          { id: '3', code: 'EUR', name: 'Euro', symbol: '€', isActive: true },
          { id: '4', code: 'GBP', name: 'British Pound', symbol: '£', isActive: true },
        ];
        await kv.set('currencies', defaultCurrencies);
        console.log('✅ Default para birimleri eklendi');
      }
      
      // Company settings setup
      const companySettings = await kv.get('companySettings');
      if (!companySettings) {
        const defaultSettings = {
          id: '1',
          companyName: 'CALAF.CO',
          address: 'İstanbul, Türkiye',
          phone: '+90 212 555 0000',
          email: 'info@calaf.co',
          website: 'www.calaf.co',
          taxNumber: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await kv.set('companySettings', defaultSettings);
        console.log('✅ Default firma ayarlari eklendi');
      }
      
      console.log('🎉 Vercel KV setup tamamlandi!');
      console.log('🔗 Uygulama hazir: Admin kullanicisi = admin/admin123');
      
    } else {
      console.log('❌ KV ping testi basarisiz');
    }
    
  } catch (error) {
    console.error('❌ Default data setup hatasi:', error);
    console.log('💡 Bu hata production da gorulur, development ta normal');
  }
}

// Main setup function
async function main() {
  console.log('📋 Vercel KV Production Setup');
  console.log('=============================');
  
  const kvAvailable = await testKVConnection();
  
  if (kvAvailable) {
    await setupDefaultData();
  } else {
    console.log('⏭️  KV setup atlandi (environment variables eksik)');
    console.log('');
    console.log('📖 Manuel Setup Adimlari:');
    console.log('1. Vercel Dashboard > Project > Storage');
    console.log('2. Create Database > KV');
    console.log('3. Environment variables otomatik eklenir');
    console.log('4. Redeploy yapin');
  }
}

// Script calistir
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testKVConnection, setupDefaultData };
