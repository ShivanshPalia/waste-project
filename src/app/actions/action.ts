"use server"
import { db } from "@/db/page";
import { UserSettings } from '@prisma/client';


export async function createUser(email: string, name: string) {
  try {
    const user = await db.user.create({
      data: {
        email,
        name,
      },
    });
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

export async function getUserByEmail(email: string) {
  try {
    // Find user by email
    const user = await db.user.findUnique({
      where: { email: email },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}

export async function getUnreadNotifications(userId: string) {
  try {
    // Fetch unread notifications where `isRead` is false for the given userId
    return await db.notification.findMany({
      where: {
        userId: userId, // userId should be the MongoDB ObjectId
        isRead: false
      }
    });
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    return [];
  }
}


export async function getRewardTransactions(userId: string) {
  try {
    console.log('Fetching transactions for user ID:', userId);

    // Query the transactions, filtering by userId, ordering by date, and limiting to 10
    const transactions = await db.transaction.findMany({
      where: {
        userId: userId, // Filter by userId
      },
      orderBy: {
        date: 'desc', // Order by date in descending order
      },
      take: 10, // Limit to 10 transactions
      select: {
        id: true,
        type: true,
        amount: true,
        description: true,
        date: true,
      },
    });

    console.log('Raw transactions from database:', transactions);

    // Format the date as YYYY-MM-DD
    const formattedTransactions = transactions.map(t => ({
      ...t,
      date: t.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
    }));

    console.log('Formatted transactions:', formattedTransactions);
    return formattedTransactions;
  } catch (error) {
    console.error("Error fetching reward transactions:", error);
    return [];
  }
}

export async function getUserBalance(userId: string): Promise<number> {
  const transactions = await getRewardTransactions(userId)
  // Reduce the transactions to calculate the balance
  const balance = transactions.reduce((acc: number, transaction: { type: string; amount: number; }) => {
    return transaction.type.startsWith('earned') ? acc + transaction.amount : acc - transaction.amount;
  }, 0);

  // Ensure balance is never negative
  return Math.max(balance, 0);
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    // Update the notification's isRead field to true
    await db.notification.update({
      where: {
        id: notificationId, // Match the notification by ID
      },
      data: {
        isRead: true, // Set isRead to true
      },
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
}

export async function createReport(
  userId: string, // MongoDB uses string IDs
  location: string,
  wasteType: string,
  amount: string,
  imageUrl?: string,
  type?: string,
  verificationResult?: any
) {
  try {
    const report = await db.report.create({
      data: {
        userId,
        location,
        wasteType,
        amount,
        imageUrl,
        verificationResult,
        status: "pending",
      },
    });

    // Award 10 points for reporting waste
    const pointsEarned = 10;
    await updateRewardPoints(userId, pointsEarned);

    // Create a transaction for the earned points
    await createTransaction(userId, 'earned_report', pointsEarned, 'Points earned for reporting waste');

    // Create a notification for the user
    await createNotification(userId, `You've earned ${pointsEarned} points for reporting waste!`, 'reward');

    return report;
  } catch (error) {
    console.error("Error creating report:", error);
    // return null;
    return { error: "Failed to create report. Please check server logs for more details." };
  }
}


export async function getReportsByUserId(userId: string) {
  try {
    const reports = await db.report.findMany({
      where: { userId },
    });
    return reports;
  } catch (error) {
    console.error("Error fetching reports:", error);
    return [];
  }
}


export async function getOrCreateReward(userId: string) {
  try {
    let reward = await db.reward.findFirst({
      where: { userId },
    });

    if (!reward) {
      reward = await db.reward.create({
        data: {
          userId,
          name: 'Default Reward',
          collectionInfo: 'Default Collection Info',
          points: 0,
          level: 1,
          isAvailable: true,
        },
      });
    }

    return reward;
  } catch (error) {
    console.error("Error getting or creating reward:", error);
    return null;
  }
}


export async function updateRewardPoints(userId: string, pointsToAdd: number) {
  try {
    const updatedReward = await db.reward.updateMany({
      where: { userId },
      data: {
        points: { increment: pointsToAdd },
        updatedAt: new Date(),
      },
    });

    return updatedReward;
  } catch (error) {
    console.error("Error updating reward points:", error);
    return null;
  }
}

export async function createCollectedWaste(reportId: string, collectorId: string, notes?: string) {
  try {
    const collectedWaste = await db.collectedWaste.create({
      data: {
        reportId,
        collectorId,
        collectionDate: new Date(),
        
      },
    });

    return collectedWaste;
  } catch (error) {
    console.error("Error creating collected waste:", error);
    return null;
  }
}


export async function getCollectedWastesByCollector(collectorId: string) {
  try {
    const collectedWastes = await db.collectedWaste.findMany({
      where: { collectorId },
    });

    return collectedWastes;
  } catch (error) {
    console.error("Error fetching collected wastes:", error);
    return [];
  }
}


export async function createNotification(userId: string, message: string, type: string) {
  try {
    const notification = await db.notification.create({
      data: {
        userId,
        message,
        type,
      },
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}



export async function createTransaction(
  userId: string, // MongoDB uses string IDs
  type: 'earned_report' | 'earned_collect' | 'redeemed',
  amount: number,
  description: string
) {
  try {
    const transaction = await db.transaction.create({
      data: {
        userId,
        type,
        amount,
        description,
      },
    });

    return transaction;
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
}


export async function redeemReward(userId: string, rewardId: string) {
  try {
    const userReward = await getOrCreateReward(userId); // Retrieves or creates a reward for the user

    // Check if userReward is null
    if (!userReward) {
      throw new Error("User reward not found or could not be created.");
    }

    if (rewardId === "0") {
      // Redeem all points
      const updatedReward = await db.reward.updateMany({
        where: { userId },
        data: {
          points: 0,
          updatedAt: new Date(),
        },
      });

      // Create a transaction for this redemption
      await createTransaction(userId, 'redeemed', userReward.points, `Redeemed all points: ${userReward.points}`);

      return updatedReward;
    } else {
      // Existing logic for redeeming specific rewards
      const availableReward = await db.reward.findUnique({
        where: { id: rewardId },
      });

      if (!availableReward) {
        throw new Error("Reward not found.");
      }

      if (userReward.points < availableReward.points) {
        throw new Error("Insufficient points to redeem the reward.");
      }

      const updatedReward = await db.reward.updateMany({
        where: { userId },
        data: {
          points: { decrement: availableReward.points },
          updatedAt: new Date(),
        },
      });
      // Create a transaction for this redemption
      await createTransaction(userId, 'redeemed', availableReward.points, `Redeemed: ${availableReward.name}`);

      return updatedReward;
    }
  } catch (error) {
    console.error("Error redeeming reward:", error);
    throw error;
  }
}


export async function getRecentReports(limit: number = 10) {
  try {
    const reports = await db.report.findMany({
      orderBy: {
        createdAt: 'desc', // Sort by createdAt in descending order
      },
      take: limit, // Limit the number of reports returned
    });

    return reports;
  } catch (error) {
    console.error("Error fetching recent reports:", error);
    return [];
  }
}


export async function getAllRewards() {
  try {
    const rewards = await db.reward.findMany({
      include: {
        user: {    // Fetch related user data
          select: {
            name: true, // Get only the user's name
          },
        },
      },
      orderBy: {
        points: 'desc', // Order rewards by points in descending order
      },
    });

    return rewards.map((reward) => ({
      id: reward.id,
      userId: reward.userId,
      points: reward.points,
      level: reward.level,
      createdAt: reward.createdAt,
      userName: reward.user?.name, // Add user name from the related user model
    }));
  } catch (error) {
    console.error("Error fetching all rewards:", error);
    return [];
  }
}

export async function getWasteCollectionTasks(limit: number = 20) {
  try {
    const tasks = await db.report.findMany({
      take: limit, // Limit the number of results
      select: {
        id: true,
        location: true,
        wasteType: true,
        amount: true,
        status: true,
        createdAt: true,  // Equivalent to 'date' in your previous structure
        collectedWastes: {
          select: {
            collectorId: true, // Assuming `collectorId` comes from the CollectedWaste relation
          },
        },
      },
    });

    // Map the results to format them as required
    return tasks.map((task) => ({
      id: task.id,
      location: task.location,
      wasteType: task.wasteType,
      amount: task.amount,
      status: task.status,
      date: task.createdAt.toISOString().split('T')[0], // Format date as YYYY-MM-DD
      collectorId: task.collectedWastes?.[0]?.collectorId ?? null, // Access the collectorId if it exists
    }));
  } catch (error) {
    console.error("Error fetching waste collection tasks:", error);
    return [];
  }
}

export async function saveReward(userId: string, amount: number) {
  try {
    const reward = await db.reward.create({
      data: {
        userId,
        name: 'Waste Collection Reward',
        collectionInfo: 'Points earned from waste collection',
        points: amount,
        level: 1,
        isAvailable: true,
      },
    });

    // Create a transaction for this reward
    await createTransaction(userId, 'earned_collect', amount, 'Points earned for collecting waste');

    return reward;
  } catch (error) {
    console.error("Error saving reward:", error);
    throw error;
  }
}

export async function saveCollectedWaste(reportId: string, collectorId: string, verificationResult: any) {
  try {
    const collectedWaste = await db.collectedWaste.create({
      data: {
        reportId,
        collectorId,
        collectionDate: new Date(),
        status: 'verified',
      },
    });
    return collectedWaste;
  } catch (error) {
    console.error("Error saving collected waste:", error);
    throw error;
  }
}


// export async function updateTaskStatus(reportId: string, newStatus: string, collectorId?: string) {
//   try {
//     const updateData: any = { status: newStatus };

//     if (collectorId !== undefined) {
//       updateData.collectedWastes = {
//         update: {
//           where: { reportId },
//           data: { collectorId },
//         },
//       };
//     }

//     const updatedReport = await db.report.update({
//       where: { id: reportId },
//       data: updateData,
//     });

//     return updatedReport;
//   } catch (error) {
//     console.error("Error updating task status:", error);
//     throw error;
//   }
// }
export async function updateTaskStatus(reportId: string, newStatus: string, collectedWasteId?: string, collectorId?: string) {
  try {
    const updateData: any = { status: newStatus };

    if (collectedWasteId && collectorId) {
      updateData.collectedWastes = {
        update: {
          where: { id: collectedWasteId }, // Use unique `collectedWasteId`
          data: { collectorId },
        },
      };
    }

    const updatedReport = await db.report.update({
      where: { id: reportId },
      data: updateData,
    });

    return updatedReport;
  } catch (error) {
    console.error("Error updating task status:", error);
    throw error;
  }
}


export async function getAvailableRewards(userId: string) {
  try {
    console.log('Fetching available rewards for user:', userId);

    // Get user's total points by fetching their reward transactions
    const userTransactions = await getRewardTransactions(userId);
    const userPoints = userTransactions.reduce((total, transaction) => {
      return transaction.type.startsWith('earned') ? total + transaction.amount : total - transaction.amount;
    }, 0);

    console.log('User total points:', userPoints);

    // Get available rewards from the database
    const dbRewards = await db.reward.findMany({
      where: { isAvailable: true },
      select: {
        id: true,
        name: true,
        points: true, // equivalent to `cost`
        description: true,
        collectionInfo: true,
      },
    });

    console.log('Rewards from database:', dbRewards);

    // Combine user points and database rewards
    const allRewards = [
      {
        id: '0', // Use a special ID for user's points
        name: "Your Points",
        cost: userPoints,
        description: "Redeem your earned points",
        collectionInfo: "Points earned from reporting and collecting waste",
      },
      ...dbRewards.map(reward => ({
        id: reward.id,
        name: reward.name,
        cost: reward.points,
        description: reward.description,
        collectionInfo: reward.collectionInfo,
      })),
    ];

    console.log('All available rewards:', allRewards);
    return allRewards;
  } catch (error) {
    console.error("Error fetching available rewards:", error);
    return [];
  }
}

export async function getUserSettings(userId: string) {
  return await db.userSettings.findFirst({
    where: { userId },
  });
}

// export async function updateUserSettings(userId: string, data: Partial<UserSettings>) {
//   return await db.userSettings.upsert({
//     where: { userId },
//     create: { userId, ...data },
//     update: data,
//   });
// }

export async function updateUserSettings(userId: string, data: Partial<UserSettings>) {
  return await db.userSettings.upsert({
    where: { userId },
    create: {
      userId,
      name: data.name ??"shivansh palia",  // Replace with a default value if not provided
      email: data.email ?? "default@example.com",  // Replace with a default or handle this
      phone: data.phone ?? "6230190654",  // Replace with a sensible default or handle missing values
      address: data.address ?? "mkjljkil",  // Default or handle missing
      notifications: data.notifications ?? true,  // Set a default value if not provided
    },
    update: data,
  });
}