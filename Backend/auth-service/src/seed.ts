import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const roleRepo = dataSource.getRepository(Role);
  const permissionRepo = dataSource.getRepository(Permission);
  const rolePermissionRepo = dataSource.getRepository(RolePermission);
  const userRepo = dataSource.getRepository(User);
  const userRoleRepo = dataSource.getRepository(UserRole);

  // Create or find Roles
  let adminRole = await roleRepo.findOne({ where: { name: 'admin' } });
  if (!adminRole) {
    adminRole = await roleRepo.save(
      roleRepo.create({ name: 'admin', description: 'Administrator role' }),
    );
    console.log('Created admin role');
  } else {
    console.log('Admin role already exists');
  }

  let userRole = await roleRepo.findOne({ where: { name: 'user' } });
  if (!userRole) {
    userRole = await roleRepo.save(
      roleRepo.create({ name: 'user', description: 'Regular user role' }),
    );
    console.log('Created user role');
  } else {
    console.log('User role already exists');
  }

  let moderatorRole = await roleRepo.findOne({ where: { name: 'moderator' } });
  if (!moderatorRole) {
    moderatorRole = await roleRepo.save(
      roleRepo.create({ name: 'moderator', description: 'Moderator role' }),
    );
    console.log('Created moderator role');
  } else {
    console.log('Moderator role already exists');
  }

  // Create or find Permissions
  const permissionsData = [
    {
      name: 'read:users',
      description: 'Read users',
      resource: 'users',
      action: 'read',
    },
    {
      name: 'write:users',
      description: 'Write users',
      resource: 'users',
      action: 'write',
    },
    {
      name: 'delete:users',
      description: 'Delete users',
      resource: 'users',
      action: 'delete',
    },
    {
      name: 'read:orders',
      description: 'Read orders',
      resource: 'orders',
      action: 'read',
    },
    {
      name: 'write:orders',
      description: 'Write orders',
      resource: 'orders',
      action: 'write',
    },
    {
      name: 'delete:orders',
      description: 'Delete orders',
      resource: 'orders',
      action: 'delete',
    },
  ];

  const permissions: Permission[] = [];
  for (const permData of permissionsData) {
    let permission = await permissionRepo.findOne({
      where: { name: permData.name },
    });
    if (!permission) {
      permission = await permissionRepo.save(permissionRepo.create(permData));
      console.log(`Created permission: ${permData.name}`);
    } else {
      console.log(`Permission already exists: ${permData.name}`);
    }
    permissions.push(permission);
  }

  // Assign all permissions to admin
  for (const permission of permissions) {
    const existing = await rolePermissionRepo.findOne({
      where: { role: { id: adminRole.id }, permission: { id: permission.id } },
    });
    if (!existing) {
      await rolePermissionRepo.save(
        rolePermissionRepo.create({ role: adminRole, permission }),
      );
      console.log(`Assigned ${permission.name} to admin`);
    }
  }

  // Assign limited permissions to moderator
  const moderatorPermissions = permissions.filter(
    (p) => p.name.includes('read') || p.name === 'write:orders',
  );
  for (const permission of moderatorPermissions) {
    const existing = await rolePermissionRepo.findOne({
      where: {
        role: { id: moderatorRole.id },
        permission: { id: permission.id },
      },
    });
    if (!existing) {
      await rolePermissionRepo.save(
        rolePermissionRepo.create({ role: moderatorRole, permission }),
      );
      console.log(`Assigned ${permission.name} to moderator`);
    }
  }

  // Assign read-only permissions to user
  const userPermissions = permissions.filter((p) => p.name.includes('read'));
  for (const permission of userPermissions) {
    const existing = await rolePermissionRepo.findOne({
      where: { role: { id: userRole.id }, permission: { id: permission.id } },
    });
    if (!existing) {
      await rolePermissionRepo.save(
        rolePermissionRepo.create({ role: userRole, permission }),
      );
      console.log(`Assigned ${permission.name} to user`);
    }
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    let admin = await userRepo.findOne({ where: { email: adminEmail } });
    if (!admin) {
      admin = await userRepo.save(
        userRepo.create({
          email: adminEmail,
          password: await bcrypt.hash(adminPassword, 12),
          firstName: 'Local',
          lastName: 'Admin',
        }),
      );
      console.log('Created configured admin user');
    }

    const assignment = await userRoleRepo.findOne({
      where: { user: { id: admin.id }, role: { id: adminRole.id } },
    });
    if (!assignment) {
      await userRoleRepo.save(
        userRoleRepo.create({ user: admin, role: adminRole }),
      );
      console.log('Assigned admin role to configured admin user');
    }
  }

  console.log('\nDatabase seeded successfully!');
  await app.close();
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
