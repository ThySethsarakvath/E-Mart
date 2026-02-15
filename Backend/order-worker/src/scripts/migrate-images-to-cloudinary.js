// Backend/order-worker/scripts/migrate-images-to-cloudinary.js
const { Client } = require('pg');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'REMOVED_SECRET',
  api_key: 'REMOVED_SECRET',
  api_secret: 'REMOVED_SECRET'
});

// Your Neon database URL
const DATABASE_URL = 'postgresql://neondb_owner:npg_BMEN7Pkjit5K@ep-rapid-snow-a10iuz6g-pooler.ap-southeast-1.aws.neon.tech/e_mart?sslmode=require';

async function migrateBanners() {
  console.log('📤 Starting banner images migration...\n');
  
  const client = new Client({ connectionString: DATABASE_URL });

  try {
    await client.connect();

    // Try both casing variations
    let result;
    try {
      result = await client.query(
        'SELECT id, title, "imagePath" FROM banner WHERE "imagePath" IS NOT NULL'
      );
    } catch (error) {
      // Try without quotes if table name is lowercase
      result = await client.query(
        'SELECT id, title, imagepath FROM banner WHERE imagepath IS NOT NULL'
      );
    }

    console.log(`Found ${result.rows.length} banners to migrate\n`);

    for (const row of result.rows) {
      const { id, title } = row;
      const imagePath = row.imagePath || row.imagepath;

      // Skip if already a Cloudinary URL
      if (imagePath.startsWith('http')) {
        console.log(`⏭️  Skipping banner #${id} (${title}) - already migrated`);
        continue;
      }

      // Path to local file
      const localFile = path.join(__dirname, '../../uploads/banners', imagePath);

      if (!fs.existsSync(localFile)) {
        console.log(`⚠️  Banner #${id} (${title}) - file not found: ${localFile}`);
        continue;
      }

      try {
        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(localFile, {
          folder: 'emart/banners',
          public_id: path.parse(imagePath).name,
          resource_type: 'image'
        });

        // Update database - try both column name variations
        try {
          await client.query(
            'UPDATE banner SET "imagePath" = $1 WHERE id = $2',
            [uploadResult.secure_url, id]
          );
        } catch (error) {
          await client.query(
            'UPDATE banner SET imagepath = $1 WHERE id = $2',
            [uploadResult.secure_url, id]
          );
        }

        console.log(`✅ Banner #${id} (${title})`);
        console.log(`   Local: ${imagePath}`);
        console.log(`   Cloudinary: ${uploadResult.secure_url}\n`);

      } catch (error) {
        console.error(`❌ Failed to migrate banner #${id} (${title}):`, error.message, '\n');
      }
    }

    console.log('✨ Banner migration complete!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await client.end();
  }
}

async function migrateProducts() {
  console.log('\n📤 Starting product images migration...\n');
  
  const client = new Client({ connectionString: DATABASE_URL });

  try {
    await client.connect();

    let result;
    try {
      result = await client.query(
        'SELECT id, name, "imagePath" FROM products WHERE "imagePath" IS NOT NULL'
      );
    } catch (error) {
      result = await client.query(
        'SELECT id, name, imagepath FROM products WHERE imagepath IS NOT NULL'
      );
    }

    console.log(`Found ${result.rows.length} products to migrate\n`);

    for (const row of result.rows) {
      const { id, name } = row;
      const imagePath = row.imagePath || row.imagepath;

      if (imagePath.startsWith('http')) {
        console.log(`⏭️  Skipping product #${id} (${name}) - already migrated`);
        continue;
      }

      const localFile = path.join(__dirname, '../../uploads/products', imagePath);

      if (!fs.existsSync(localFile)) {
        console.log(`⚠️  Product #${id} (${name}) - file not found: ${localFile}`);
        continue;
      }

      try {
        const uploadResult = await cloudinary.uploader.upload(localFile, {
          folder: 'emart/products',
          public_id: path.parse(imagePath).name,
          resource_type: 'image'
        });

        try {
          await client.query(
            'UPDATE products SET "imagePath" = $1 WHERE id = $2',
            [uploadResult.secure_url, id]
          );
        } catch (error) {
          await client.query(
            'UPDATE products SET imagepath = $1 WHERE id = $2',
            [uploadResult.secure_url, id]
          );
        }

        console.log(`✅ Product #${id} (${name})`);
        console.log(`   Cloudinary: ${uploadResult.secure_url}\n`);

      } catch (error) {
        console.error(`❌ Failed to migrate product #${id}:`, error.message, '\n');
      }
    }

    console.log('✨ Product migration complete!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await client.end();
  }
}

async function migrateArrivals() {
  console.log('\n📤 Starting arrivals images migration...\n');
  
  const client = new Client({ connectionString: DATABASE_URL });

  try {
    await client.connect();

    let result;
    try {
      result = await client.query(
        'SELECT id, title, "imagePath" FROM arrival WHERE "imagePath" IS NOT NULL'
      );
    } catch (error) {
      result = await client.query(
        'SELECT id, title, imagepath FROM arrival WHERE imagepath IS NOT NULL'
      );
    }

    console.log(`Found ${result.rows.length} arrivals to migrate\n`);

    for (const row of result.rows) {
      const { id, title } = row;
      const imagePath = row.imagePath || row.imagepath;

      if (imagePath.startsWith('http')) {
        console.log(`⏭️  Skipping arrival #${id} - already migrated`);
        continue;
      }

      const localFile = path.join(__dirname, '../../uploads/arrivals', imagePath);

      if (!fs.existsSync(localFile)) {
        console.log(`⚠️  Arrival #${id} - file not found`);
        continue;
      }

      try {
        const uploadResult = await cloudinary.uploader.upload(localFile, {
          folder: 'emart/arrivals',
          public_id: path.parse(imagePath).name,
          resource_type: 'image'
        });

        try {
          await client.query(
            'UPDATE arrival SET "imagePath" = $1 WHERE id = $2',
            [uploadResult.secure_url, id]
          );
        } catch (error) {
          await client.query(
            'UPDATE arrival SET imagepath = $1 WHERE id = $2',
            [uploadResult.secure_url, id]
          );
        }

        console.log(`✅ Arrival #${id}: ${uploadResult.secure_url}\n`);

      } catch (error) {
        console.error(`❌ Failed to migrate arrival #${id}:`, error.message, '\n');
      }
    }

    console.log('✨ Arrivals migration complete!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await client.end();
  }
}

async function migratePromotions() {
  console.log('\n📤 Starting promotions images migration...\n');
  
  const client = new Client({ connectionString: DATABASE_URL });

  try {
    await client.connect();

    let result;
    try {
      // Try to get all columns first to see what's available
      result = await client.query(
        'SELECT * FROM promotion WHERE "imagePath" IS NOT NULL LIMIT 1'
      );
      
      // If that works, get all records
      if (result.rows.length > 0) {
        result = await client.query(
          'SELECT id, "imagePath" FROM promotion WHERE "imagePath" IS NOT NULL'
        );
      }
    } catch (error) {
      // Try lowercase column name
      result = await client.query(
        'SELECT id, imagepath FROM promotion WHERE imagepath IS NOT NULL'
      );
    }

    console.log(`Found ${result.rows.length} promotions to migrate\n`);

    for (const row of result.rows) {
      const { id } = row;
      const imagePath = row.imagePath || row.imagepath;

      if (!imagePath) {
        console.log(`⏭️  Skipping promotion #${id} - no image path`);
        continue;
      }

      if (imagePath.startsWith('http')) {
        console.log(`⏭️  Skipping promotion #${id} - already migrated`);
        continue;
      }

      const localFile = path.join(__dirname, '../../uploads/promotions', imagePath);

      if (!fs.existsSync(localFile)) {
        console.log(`⚠️  Promotion #${id} - file not found: ${localFile}`);
        continue;
      }

      try {
        const uploadResult = await cloudinary.uploader.upload(localFile, {
          folder: 'emart/promotions',
          public_id: path.parse(imagePath).name,
          resource_type: 'image'
        });

        try {
          await client.query(
            'UPDATE promotion SET "imagePath" = $1 WHERE id = $2',
            [uploadResult.secure_url, id]
          );
        } catch (error) {
          await client.query(
            'UPDATE promotion SET imagepath = $1 WHERE id = $2',
            [uploadResult.secure_url, id]
          );
        }

        console.log(`✅ Promotion #${id}: ${uploadResult.secure_url}\n`);

      } catch (error) {
        console.error(`❌ Failed to migrate promotion #${id}:`, error.message, '\n');
      }
    }

    console.log('✨ Promotions migration complete!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await client.end();
  }
}

async function migrateCategories() {
  console.log('\n📤 Starting categories images migration...\n');
  
  const client = new Client({ connectionString: DATABASE_URL });

  try {
    await client.connect();

    let result;
    try {
      result = await client.query(
        'SELECT id, name, "imagePath" FROM categories WHERE "imagePath" IS NOT NULL'
      );
    } catch (error) {
      result = await client.query(
        'SELECT id, name, imagepath FROM categories WHERE imagepath IS NOT NULL'
      );
    }

    console.log(`Found ${result.rows.length} categories to migrate\n`);

    for (const row of result.rows) {
      const { id, name } = row;
      const imagePath = row.imagePath || row.imagepath;

      if (imagePath.startsWith('http')) {
        console.log(`⏭️  Skipping category #${id} (${name}) - already migrated`);
        continue;
      }

      const localFile = path.join(__dirname, '../../uploads/categories', imagePath);

      if (!fs.existsSync(localFile)) {
        console.log(`⚠️  Category #${id} (${name}) - file not found: ${localFile}`);
        continue;
      }

      try {
        const uploadResult = await cloudinary.uploader.upload(localFile, {
          folder: 'emart/categories',
          public_id: path.parse(imagePath).name,
          resource_type: 'image'
        });

        try {
          await client.query(
            'UPDATE categories SET "imagePath" = $1 WHERE id = $2',
            [uploadResult.secure_url, id]
          );
        } catch (error) {
          await client.query(
            'UPDATE categories SET imagepath = $1 WHERE id = $2',
            [uploadResult.secure_url, id]
          );
        }

        console.log(`✅ Category #${id} (${name})`);
        console.log(`   Cloudinary: ${uploadResult.secure_url}\n`);

      } catch (error) {
        console.error(`❌ Failed to migrate category #${id} (${name}):`, error.message, '\n');
      }
    }

    console.log('✨ Categories migration complete!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await client.end();
  }
}

// Run all migrations
async function migrateAll() {
  await migrateBanners();
  await migrateProducts();
  await migrateArrivals();
  await migratePromotions();
  await migrateCategories();
  console.log('\n🎉 All migrations complete!');
  process.exit(0);
}

migrateAll();