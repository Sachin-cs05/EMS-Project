import Notification from '../models/Notification.js';

// Notification failures must never change the successful business operation
// that triggered them. The duplicate check also protects against retries.
export const createNotificationSafely = async (notification) => {
  try {
    const duplicate = await Notification.exists({
      recipient: notification.recipient,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      link: notification.link || '',
    });

    if (!duplicate) {
      await Notification.create(notification);
    }
  } catch (error) {
    console.error('Notification creation failed:', error.message);
  }
};

export const notifyActiveAdminsSafely = async (notification, User) => {
  try {
    const admins = await User.find({ role: 'admin', isActive: true }).select('_id');

    await Promise.all(
      admins.map((admin) =>
        createNotificationSafely({ ...notification, recipient: admin._id })
      )
    );
  } catch (error) {
    console.error('Admin notification creation failed:', error.message);
  }
};
