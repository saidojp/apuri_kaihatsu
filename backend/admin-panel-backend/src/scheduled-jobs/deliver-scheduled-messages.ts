import DB from '../utils/db-client';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Delivers scheduled messages that are due for delivery
 * This function should be run as a cron job (e.g. every minute)
 */
async function deliverScheduledMessages() {
  try {
    console.log('[Scheduled Job] Checking for scheduled messages to deliver...');

    // Find messages that are scheduled and ready to be delivered
    const scheduledMessages = await DB.query(`
      SELECT id, title, delivery_at
      FROM Post 
      WHERE delivery_at IS NOT NULL 
        AND (
          -- For pipe-formatted dates (custom format)
          (delivery_at LIKE '%|%' AND 
            TIMESTAMP(
              CONCAT(
                SUBSTRING_INDEX(delivery_at, '|', 1),
                ' ',
                SUBSTRING_INDEX(delivery_at, '|', -1)
              )
            ) <= NOW()
          )
          OR
          -- For standard MySQL datetime format
          (delivery_at NOT LIKE '%|%' AND delivery_at <= NOW())
        )
        AND (
          (delivery_at LIKE '%|%' AND 
            TIMESTAMP(
              CONCAT(
                SUBSTRING_INDEX(delivery_at, '|', 1),
                ' ',
                SUBSTRING_INDEX(delivery_at, '|', -1)
              )
            ) > DATE_SUB(NOW(), INTERVAL 10 MINUTE)
          )
          OR
          (delivery_at NOT LIKE '%|%' AND delivery_at > DATE_SUB(NOW(), INTERVAL 10 MINUTE))
        )
    `);

    if (scheduledMessages.length === 0) {
      console.log('[Scheduled Job] No messages to deliver at this time');
      return;
    }

    console.log(`[Scheduled Job] Found ${scheduledMessages.length} messages to deliver`);

    for (const message of scheduledMessages) {
      console.log(`[Scheduled Job] Delivering message: ${message.id} - ${message.title}`);
      
      // Update the message to mark it as delivered (clear the delivery_at timestamp)
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

// If this script is run directly (not imported), execute the function
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