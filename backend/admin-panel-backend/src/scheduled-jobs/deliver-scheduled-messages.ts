import DB from '../utils/db-client';
import * as dotenv from 'dotenv';

dotenv.config();

async function deliverScheduledMessages() {
  try {
    console.log('[Scheduled Job] Checking for scheduled messages to deliver...');

    await DB.execute(`SET time_zone = '+00:00'`); // Set session to UTC

    const scheduledMessages = await DB.query(`
      SELECT id, title, delivery_at
      FROM Post 
      WHERE delivery_at IS NOT NULL 
        AND delivery_at <= NOW()
        AND delivery_at > DATE_SUB(NOW(), INTERVAL 10 MINUTE)
    `);

    if (scheduledMessages.length === 0) {
      console.log('[Scheduled Job] No messages to deliver at this time');
      return;
    }

    console.log(`[Scheduled Job] Found ${scheduledMessages.length} messages to deliver`);

    for (const message of scheduledMessages) {
      console.log(`[Scheduled Job] Delivering message: ${message.id} - ${message.title}`);
      
      await DB.execute(`
        UPDATE Post 
        SET delivery_at = NULL,
            delivered_at = NOW(),
            status = 'delivered' 
        WHERE id = :id
      `, {
        id: message.id
      });
      
      console.log(`[Scheduled Job] Message ${message.id} delivered successfully`);
    }

    console.log('[Scheduled Job] All scheduled messages processed successfully');
  } catch (error) {
    console.error('[Scheduled Job] Error delivering scheduled messages:', error);
  }
}

if (require.main === module) {
  deliverScheduledMessages()
    .then(() => {
      console.log('[Scheduled Job] Completed scheduled message delivery task');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[Scheduled Job] Fatal error:', error);
      process.exit(1);
    });
}

export default deliverScheduledMessages;