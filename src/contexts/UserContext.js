import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";

export const UserContext = createContext();

const BASE_URL = process.env.REACT_APP_BASEURL;

const authHeaders = (token) => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    "X-Requested-With": "XMLHttpRequest",
});

const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("未登入，請重新登入");
    return token;
};

const validateId = (id) => {
    const num = Number(id);
    if (!Number.isInteger(num) || num <= 0) throw new Error("無效的 ID");
    return num;
};

export const UserProvider = ({ children }) => {
    const [tableData, setTableData] = useState([]);
    const [error, setError] = useState(null);
    const { logout } = useContext(AuthContext);

    useEffect(() => {
        setTableData([
            { Id: "1", title: "小明", content: "ming@example.com", startTime: "0912-345-678", endTime: "0987-654-321" },
            { Id: "2", title: "小美", content: "mei@example.com", startTime: "0987-654-321", endTime: "0987-654-321" },
        ]);
    }, []);

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

    // Create a new schedule event
    const createSchedule = async (scheduleData) => {
        try {
            const token = getToken();
            const response = await fetch(`${BASE_URL}/api/schedules/create`, {
                method: "POST",
                headers: authHeaders(token),
                body: JSON.stringify(scheduleData),
            });

            const data = await handleResponse(response);
            setTableData((prev) => [...prev, data.data]);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Get all schedules for the user
    const getSchedules = async (userId) => {
        try {
            const token = getToken();
            const response = await fetch(`${BASE_URL}/api/schedules/query`, {
                method: "POST",
                headers: authHeaders(token),
                body: JSON.stringify({ user_id: Number(userId) }),
            });

            const data = await handleResponse(response);
            const schedules = data.data?.schedule ?? [];
            const displayData = schedules.map((element) => ({
                Id: String(element.id),
                title: element.title,
                content: element.description ?? "",
                startTime: element.start_time,
                endTime: element.end_time,
                isPublic: element.is_public ?? false,
                location: element.location ?? "",
                participants: element.participants ?? "",
            }));
            if (displayData.length > 0) {
                setTableData(displayData);
            }
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Update a schedule event
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
                prev.map((schedule) =>
                    schedule.Id === String(safeId) ? { ...schedule, ...scheduleData } : schedule
                )
            );
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Delete a schedule event
    const deleteSchedule = async (id) => {
        try {
            const token = getToken();
            const safeId = validateId(id);
            const response = await fetch(`${BASE_URL}/api/schedules/delete/${safeId}`, {
                method: "DELETE",
                headers: authHeaders(token),
            });

            const data = await handleResponse(response);
            setTableData((prev) => prev.filter((schedule) => schedule.Id !== String(safeId)));
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    return (
        <UserContext.Provider value={{
            tableData,
            error,
            createSchedule,
            getSchedules,
            updateSchedule,
            deleteSchedule,
        }}>
            {children}
        </UserContext.Provider>
    );
};
