import React, { createContext, useState, useEffect } from "react";

export const ScheduleContext = createContext();

export const ScheduleProvider = ({ children }) => {
    const [tableData, setTableData] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, "0");
        setTableData([
            { Id: "1", title: "部門會議", content: "討論 Q1 目標與 KPI 分配", startTime: `${y}-${m}-05T10:00`, endTime: `${y}-${m}-05T11:00`, isPublic: true,  location: "會議室 A", participants: "小明、小美、老王" },
            { Id: "2", title: "健身房", content: "重訓 + 有氧 30 分鐘", startTime: `${y}-${m}-05T18:00`, endTime: `${y}-${m}-05T19:00`, isPublic: false, location: "健身中心 2F", participants: "" },
            { Id: "3", title: "團隊午餐", content: "慶祝專案上線", startTime: `${y}-${m}-12T12:00`, endTime: `${y}-${m}-12T13:00`, isPublic: true,  location: "饗食天堂", participants: "全體成員" },
            { Id: "4", title: "看牙醫", content: "定期洗牙檢查", startTime: `${y}-${m}-12T15:00`, endTime: `${y}-${m}-12T16:00`, isPublic: false, location: "仁愛牙醫診所", participants: "" },
            { Id: "5", title: "產品發布", content: "v2.0 正式上線發布會", startTime: `${y}-${m}-18T09:00`, endTime: `${y}-${m}-18T10:00`, isPublic: true,  location: "線上直播", participants: "產品團隊、行銷部" },
            { Id: "6", title: "讀書會", content: "《Clean Code》第 5-8 章討論", startTime: `${y}-${m}-20T19:00`, endTime: `${y}-${m}-20T21:00`, isPublic: true,  location: "圖書館 3F 討論室", participants: "小明、阿智、Mary" },
            { Id: "7", title: "家庭聚餐", content: "週末家庭晚餐", startTime: `${y}-${m}-22T18:00`, endTime: `${y}-${m}-22T20:00`, isPublic: false, location: "家裡", participants: "家人" },
            { Id: "8", title: "個人學習", content: "React 進階課程 Unit 12", startTime: `${y}-${m}-25T20:00`, endTime: `${y}-${m}-25T22:00`, isPublic: false, location: "", participants: "" },
        ]);
    }, []);



    // Create a new schedule event
    const createSchedule = async (scheduleData) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${process.env.REACT_APP_BASEURL}/api/schedules`, {
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
    const getSchedules = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${process.env.REACT_APP_BASEURL}/api/schedules`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            console.log("data ---> ", data.data);



            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch schedules');
            }

            const displayData = data.data.map((element) => {
                const returnData = {};
                returnData["Id"] = element.id;
                returnData["title"] = element.title;
                returnData["content"] = element.description;
                returnData["startTime"] = element.start_time;
                returnData["endTime"] = element.end_time;
                returnData["isPublic"] = element.is_public ?? false;

                return returnData;
            }) 
            if (data.data.length > 0) {
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
            const response = await fetch(`${process.env.REACT_APP_BASEURL}/api/schedules/${id}`, {
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
            const response = await fetch(`${process.env.REACT_APP_BASEURL}/api/schedules/${id}`, {
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
        <ScheduleContext.Provider value={{
            tableData,
            error,
            createSchedule,
            getSchedules,
            updateSchedule,
            deleteSchedule
        }}>
            {children}
        </ScheduleContext.Provider>
    );
};
