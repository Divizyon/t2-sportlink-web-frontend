import api from '@/lib/services/api';

interface DateRange {
    from?: Date;
    to?: Date;
}

/**
 * Fetch all dashboard data in a single API call
 */
export const fetchDashboardData = async () => {
    try {
        const response = await api.get('/dashboard/all-data');

        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to fetch dashboard data');
        }

        return response.data.data;
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
    }
};

/**
 * Fetch dashboard overview statistics
 */
export const fetchDashboardStats = async () => {
    try {
        const response = await api.get('/dashboard/stats');

        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to fetch dashboard statistics');
        }

        return response.data.data;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
};

/**
 * Fetch sport popularity statistics
 */
export const fetchSportPopularity = async () => {
    try {
        const response = await api.get('/dashboard/sports-popularity');

        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to fetch sport popularity data');
        }

        return response.data.data;
    } catch (error) {
        console.error('Error fetching sport popularity:', error);
        throw error;
    }
};

/**
 * Fetch sport events statistics by date range
 */
export const fetchSportsByDateRange = async (dateRange: DateRange) => {
    try {
        let url = '/dashboard/sports-by-date';

        // Add query parameters if date range is provided
        if (dateRange.from || dateRange.to) {
            const params = new URLSearchParams();

            if (dateRange.from) {
                params.append('from', dateRange.from.toISOString());
            }

            if (dateRange.to) {
                params.append('to', dateRange.to.toISOString());
            }

            url += `?${params.toString()}`;
        }

        const response = await api.get(url);

        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to fetch sport events by date');
        }

        return response.data.data;
    } catch (error) {
        console.error('Error fetching sport events by date:', error);
        throw error;
    }
};

/**
 * Fetch latest events, news, and announcements
 */
export const fetchLatestItems = async (hours = 24) => {
    try {
        const response = await api.get(`/dashboard/latest-items?hours=${hours}`);

        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to fetch latest items');
        }

        return response.data.data;
    } catch (error) {
        console.error('Error fetching latest items:', error);
        throw error;
    }
}; 