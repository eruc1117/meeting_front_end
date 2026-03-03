import React, { createContext, useState } from "react";

export const ScheduleContext = createContext();

const BASE_URL = process.env.REACT_APP_BASEURL;

const authHeaders = (token) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
});

const mapSchedule = (element) => ({
    Id: String(element.id),
    title: element.title,
    content: element.description ?? "",
    startTime: element.start_time,
    endTime: element.end_time,
    isPublic: element.is_public ?? false,
    location: element.location ?? "",
    participants: element.participants ?? "",
});

export const ScheduleProvider = ({ children }) => {
    const [tableData, setTableData] = useState([]);
    const [error, setError] = useState(null);

    // 查詢活動列表（POST /api/schedules/query）
    const getSchedules = async (userId, startTime, endTime) => {
        try {
            const token = localStorage.getItem("token");
            const body = { user_id: Number(userId) };
            if (startTime) body.start_time = startTime;
            if (endTime) body.end_time = endTime;

            const response = await fetch(`${BASE_URL}/api/schedules/query`, {
                method: "POST",
                headers: authHeaders(token),
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch schedules");
            }

            const schedules = data.data?.schedule ?? [];
            setTableData(schedules.map(mapSchedule));
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // 建立活動（POST /api/schedules/create）
    const createSchedule = async (scheduleData) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${BASE_URL}/api/schedules/create`, {
                method: "POST",
                headers: authHeaders(token),
                body: JSON.stringify(scheduleData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to create schedule");
            }

            setTableData((prev) => [...prev, mapSchedule(data.data)]);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // 更新活動（PUT /api/schedules/update/:id）
    const updateSchedule = async (id, scheduleData) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${BASE_URL}/api/schedules/update/${id}`, {
                method: "PUT",
                headers: authHeaders(token),
                body: JSON.stringify(scheduleData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to update schedule");
            }

            setTableData((prev) =>
                prev.map((s) => (s.Id === String(id) ? { ...s, ...scheduleData } : s))
            );
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // 刪除活動（DELETE /api/schedules/delete/:id）
    const deleteSchedule = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${BASE_URL}/api/schedules/delete/${id}`, {
                method: "DELETE",
                headers: authHeaders(token),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to delete schedule");
            }

            setTableData((prev) => prev.filter((s) => s.Id !== String(id)));
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // 參加公開活動（POST /api/schedules/attend/:id）
    const attendSchedule = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${BASE_URL}/api/schedules/attend/${id}`, {
                method: "POST",
                headers: authHeaders(token),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to attend schedule");
            }

            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // 退出公開活動（DELETE /api/schedules/attend/:id）
    const leaveSchedule = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${BASE_URL}/api/schedules/attend/${id}`, {
                method: "DELETE",
                headers: authHeaders(token),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to leave schedule");
            }

            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    return (
        <ScheduleContext.Provider
            value={{
                tableData,
                error,
                getSchedules,
                createSchedule,
                updateSchedule,
                deleteSchedule,
                attendSchedule,
                leaveSchedule,
            }}
        >
            {children}
        </ScheduleContext.Provider>
    );
};
