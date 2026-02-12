import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { Payment } from '../../payments/entity/payment.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  orderNumber: string;

  @Column({ nullable: true })
  userId: number;

  @Column()
  customerFirstName: string;

  @Column()
  customerLastName: string;

  @Column()
  customerEmail: string;

  @Column()
  customerPhone: string;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;

  @Column('decimal', { precision: 10, scale: 2 })
  tax: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING',
  })
  status: string;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
    default: 'PENDING',
  })
  paymentStatus: string;

  @Column({ nullable: true })
  paymentMethod: string;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items: OrderItem[];

  @OneToOne(() => Payment, { nullable: true })
  @JoinColumn({ name: 'transactionId', referencedColumnName: 'transactionId' })
  payment: Payment;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
