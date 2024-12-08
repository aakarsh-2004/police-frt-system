import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { subDays, startOfDay, endOfDay } from "date-fns";
import createHttpError from "http-errors";

export const getRecognitionStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const isPreviousPeriod = req.query.period === 'previous';
        const today = new Date();
        const dateRange = {
            gte: startOfDay(isPreviousPeriod ? subDays(today, 1) : today),
            lt: endOfDay(isPreviousPeriod ? today : today)
        };

        const [totalDetections, successfulMatches] = await Promise.all([
            prisma.recognizedPerson.count({
                where: {
                    capturedDateTime: dateRange
                }
            }),
            prisma.recognizedPerson.count({
                where: {
                    capturedDateTime: dateRange,
                    confidenceScore: {
                        gte: '80'
                    }
                }
            })
        ]);

        res.json({
            data: {
                totalDetections,
                successfulMatches
            }
        });
    } catch (error) {
        next(createHttpError(500, "Error fetching recognition stats: " + error));
    }
};

export const getPersonStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const isPreviousPeriod = req.query.period === 'previous';
        const today = new Date();
        const dateRange = {
            gte: startOfDay(isPreviousPeriod ? subDays(today, 1) : today),
            lt: endOfDay(isPreviousPeriod ? today : today)
        };

        const total = await prisma.person.count({
            where: {
                createdAt: dateRange
            }
        });
        
        res.json({
            data: {
                total
            }
        });
    } catch (error) {
        next(createHttpError(500, "Error fetching person stats: " + error));
    }
};

export const getDetectionTrends = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get daily trends for last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const daily = await prisma.recognizedPerson.findMany({
            where: {
                capturedDateTime: {
                    gte: sevenDaysAgo
                }
            },
            select: {
                capturedDateTime: true,
            },
            orderBy: {
                capturedDateTime: 'desc'
            }
        });

        // Group by type
        const byType = await prisma.person.groupBy({
            by: ['type'],
            _count: {
                id: true
            }
        });

        // Get top locations
        const byLocation = await prisma.recognizedPerson.findMany({
            take: 5,
            select: {
                camera: {
                    select: {
                        location: true
                    }
                }
            },
            orderBy: {
                capturedDateTime: 'desc'
            }
        });

        // Group by confidence ranges with proper parsing
        const recognitions = await prisma.recognizedPerson.findMany({
            select: {
                confidenceScore: true
            }
        });

        // Initialize confidence ranges
        const confidenceRanges = {
            '90-100': 0,
            '80-89': 0,
            '70-79': 0,
            '60-69': 0,
            'Below 60': 0
        };

        // Process each recognition's confidence score
        recognitions.forEach(rec => {
            // Parse the confidence score and handle invalid values
            const confidence = parseFloat(rec.confidenceScore);
            if (isNaN(confidence)) {
                return; // Skip invalid confidence scores
            }

            // Categorize into ranges
            if (confidence >= 90) {
                confidenceRanges['90-100']++;
            } else if (confidence >= 80) {
                confidenceRanges['80-89']++;
            } else if (confidence >= 70) {
                confidenceRanges['70-79']++;
            } else if (confidence >= 60) {
                confidenceRanges['60-69']++;
            } else {
                confidenceRanges['Below 60']++;
            }
        });

        // Convert to array format for the chart
        const confidenceData = Object.entries(confidenceRanges)
            .filter(([_, count]) => count > 0) // Only include ranges with data
            .map(([range, count]) => ({
                confidenceScore: range,
                _count: { id: count }
            }))
            .sort((a, b) => {
                // Custom sort to maintain range order
                const getMinValue = (range: string) => {
                    if (range === 'Below 60') return 0;
                    return parseInt(range.split('-')[0]);
                };
                return getMinValue(b.confidenceScore) - getMinValue(a.confidenceScore);
            });

        // Group daily detections by date
        const dailyGroups = daily.reduce((acc: Record<string, number>, curr) => {
            const date = new Date(curr.capturedDateTime).toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        // Convert to array format for charts
        const dailyData = Object.entries(dailyGroups).map(([date, count]) => ({
            capturedDateTime: date,
            _count: { id: count }
        }));

        // Format location data
        const locationCounts = byLocation.reduce((acc: Record<string, number>, curr) => {
            const location = curr.camera?.location || 'Unknown';
            acc[location] = (acc[location] || 0) + 1;
            return acc;
        }, {});

        const locationData = Object.entries(locationCounts).map(([location, count]) => ({
            camera: { location },
            _count: { id: count }
        }));

        res.json({
            message: "Detection trends fetched successfully",
            data: {
                daily: dailyData,
                byType,
                byLocation: locationData,
                byConfidence: confidenceData
            }
        });
    } catch (error) {
        console.error("Error in getDetectionTrends:", error);
        next(createHttpError(500, "Error fetching detection trends: " + error));
    }
}; 