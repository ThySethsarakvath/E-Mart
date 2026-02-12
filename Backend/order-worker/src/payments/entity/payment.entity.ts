import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', nullable: true })
  orderId: number;

  @Column({ unique: true })
  transactionId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'SUCCESS', 'FAILED', 'EXPIRED'],
    default: 'PENDING',
  })
  status: string;

  @Column({ nullable: true })
  qrString: string;

  @Column({ nullable: true })
  paymentMethod: string;

  @Column({ nullable: true })
  approvalCode: string;

  @Column({ nullable: true })
  customerEmail: string;

  @Column({ nullable: true })
  customerPhone: string;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
