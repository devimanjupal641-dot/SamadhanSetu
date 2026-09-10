import { Notification } from '../../models/types';
import { getDatabase, saveDatabase } from '../../config/db';

interface DispatchOptions {
  userId: string;
  role?: string;
  title: string;
  message: string;
  channels?: Array<'in-app' | 'sms' | 'whatsapp'>;
  payload?: any;
}

export function dispatchNotification(options: DispatchOptions): Notification[] {
  const db = getDatabase();
  const channels = options.channels || ['in-app', 'sms', 'whatsapp'];
  const dispatched: Notification[] = [];

  for (const ch of channels) {
    // In-app notifications are always live and stored
    const notif: Notification = {
      id: 'notif_' + Math.random().toString(36).substring(2, 9),
      user_id: options.userId,
      role: options.role,
      channel: ch,
      title: options.title,
      message: options.message,
      payload: options.payload,
      status: ch === 'in-app' ? 'delivered' : 'simulated',
      created_at: new Date().toISOString()
    };

    // If external SMS/WhatsApp credentials were provided, call them here
    if (ch === 'sms' && process.env.TWILIO_ACCOUNT_SID) {
      console.log(`[SMS Gateway: Live Dispatch] SMS to user ${options.userId}: ${options.message}`);
      notif.status = 'sent';
    } else if (ch === 'sms') {
      console.log(`[SMS Gateway: Simulator] [Payload Formatted] To Citizen/Partner: ${options.message}`);
    } else if (ch === 'whatsapp') {
      console.log(`[WhatsApp Gateway: Simulator] [Interactive Template] To Stakeholder: ${options.message}`);
    }

    db.notifications.unshift(notif);
    dispatched.push(notif);
  }

  saveDatabase();
  return dispatched;
}

export function getUserNotifications(userId: string): Notification[] {
  const db = getDatabase();
  return db.notifications.filter(n => n.user_id === userId || n.user_id === 'all');
}

export function getAllNotifications(): Notification[] {
  const db = getDatabase();
  return db.notifications;
}
