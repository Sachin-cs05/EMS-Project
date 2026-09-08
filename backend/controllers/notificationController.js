import Notification from '../models/Notification.js';

import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          notifications,
          unreadCount,
        },
        'Notifications fetched successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: req.user._id,
      },
      {
        isRead: true,
      },
      {
        new: true,
      }
    );

    if (!notification) {
      return next(
        new ApiError(404, 'Notification not found')
      );
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        { notification },
        'Notification marked as read'
      )
    );
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user._id,
        isRead: false,
      },
      {
        isRead: true,
      }
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        null,
        'All notifications marked as read'
      )
    );
  } catch (error) {
    next(error);
  }
};