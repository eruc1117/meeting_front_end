import React, { createContext, useState, useContext } from "react";
import { AuthContext } from "./AuthContext";

export const ScheduleContext = createContext();

const BASE_URL = process.env.REACT_APP_BASEURL;

const authHeaders = (token) => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    "X-Requested-With": "XMLHttpRequest",
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

const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("未登入，請重新登入");
    return token;
};

const validateId = (id) => {
    const num = Number(id);
    if (!Number.isInteger(num) || num <= 0) throw new Error("無效的活動 ID");
    return num;
};

export const ScheduleProvider = ({ children }) => {
    const [tableData, setTableData] = useState([]);
    const [error, setError] = useState(null);
    const { logout } = useContext(AuthContext);

    const handleResponse = async (response) => {
        if (response.status === 401) {
            logout();
            throw new Error("登入已過期，請重新登入");
        }
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "請求失敗");
        }
        return data;
    };

    // 查詢活動列表（POST /api/schedules/query）
    const getSchedules = async (userId, startTime, endTime) => {
        try {
            const token = getToken();
            const body = { user_id: Number(userId) };
            if (startTime) body.start_time = startTime;
            if (endTime) body.end_time = endTime;

            const response = await fetch(`${BASE_URL}/api/schedules/query`, {
                method: "POST",
                headers: authHeaders(token),
                body: JSON.stringify(body),
            });

            const data = await handleResponse(response);
            const schedules = data.data?.schedule ?? [];
            const mapped = schedules.map(mapSchedule);
            setTableData(mapped);
            return mapped;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // 建立活動（POST /api/schedules/create）
    const createSchedule = async (scheduleData) => {
        try {
            const token = getToken();
            const response = await fetch(`${BASE_URL}/api/schedules/create`, {
                method: "POST",
                headers: authHeaders(token),
                body: JSON.stringify(scheduleData),
            });

            const data = await handleResponse(response);
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
            const token = getToken();
            const safeId = validateId(id);
            const response = await fetch(`${BASE_URL}/api/schedules/update/${safeId}`, {
                method: "PUT",
                headers: authHeaders(token),
                body: JSON.stringify(scheduleData),
            });

            const data = await handleResponse(response);
            setTableData((prev) =>
                prev.map((s) => (s.Id === String(safeId) ? { ...s, ...scheduleData } : s))
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
            const token = getToken();
            const safeId = validateId(id);
            const response = await fetch(`${BASE_URL}/api/schedules/delete/${safeId}`, {
                method: "DELETE",
                headers: authHeaders(token),
            });

            const data = await handleResponse(response);
            setTableData((prev) => prev.filter((s) => s.Id !== String(safeId)));
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // 參加公開活動（POST /api/schedules/attend/:id）
    const attendSchedule = async (id) => {
        try {
            const token = getToken();
            const safeId = validateId(id);
            const response = await fetch(`${BASE_URL}/api/schedules/attend/${safeId}`, {
                method: "POST",
                headers: authHeaders(token),
            });

            return await handleResponse(response);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // 退出公開活動（DELETE /api/schedules/attend/:id）
    const leaveSchedule = async (id) => {
        try {
            const token = getToken();
            const safeId = validateId(id);
            const response = await fetch(`${BASE_URL}/api/schedules/attend/${safeId}`, {
                method: "DELETE",
                headers: authHeaders(token),
            });

            return await handleResponse(response);
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
