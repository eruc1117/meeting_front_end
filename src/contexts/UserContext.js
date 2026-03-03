import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [tableData, setTableData] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        setTableData([
            { Id: "1", title: "小明", content: "ming@example.com", startTime: "0912-345-678", endTime: "0987-654-321" },
            { Id: "1",title: "小美", content: "mei@example.com", startTime: "0987-654-321", endTime: "0987-654-321" },
        ]);
    }, []);



    // Create a new schedule event
    const createSchedule = async (scheduleData) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${process.env.REACT_APP_BASEURL}/api/schedules/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(scheduleData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create schedule');
            }

            // Update table data with new schedule
            setTableData(prev => [...prev, data.data]);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Get all schedules for the user
    const getSchedules = async (userId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${process.env.REACT_APP_BASEURL}/api/schedules/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ user_id: Number(userId) })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch schedules');
            }

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
            const token = localStorage.getItem("token");
            const response = await fetch(`${process.env.REACT_APP_BASEURL}/api/schedules/update/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(scheduleData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update schedule');
            }

            // Update the table data with the modified schedule
            setTableData(prev => prev.map(schedule =>
                schedule.id === id ? { ...schedule, ...scheduleData } : schedule
            ));
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Delete a schedule event
    const deleteSchedule = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${process.env.REACT_APP_BASEURL}/api/schedules/delete/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete schedule');
            }

            // Remove the deleted schedule from table data
            setTableData(prev => prev.filter(schedule => schedule.id !== id));
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
            deleteSchedule
        }}>
            {children}
        </UserContext.Provider>
    );
};
