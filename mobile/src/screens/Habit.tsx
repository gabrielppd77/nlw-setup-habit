import { useEffect, useState } from "react";
import { ScrollView, View, Text, Alert } from "react-native";
import { useRoute } from "@react-navigation/native";

import dayjs from "dayjs";

import { BackButton } from "../components/BackButton";
import { ProgressBar } from "../components/ProgressBar";
import { Checkbox } from "../components/Checkbox";
import { Loading } from "../components/Loading";
import { HabitEmpty } from "../components/HabitEmpty";

import { api } from "../lib/axios";
import { generateProgressPercentage } from "../utils/generate-progress-percentage";
import clsx from "clsx";

interface ParamsRoute {
  date: string;
}

interface DayInfoProps {
  completedHabits: string[];
  possibleHabits: {
    id: string;
    title: string;
  }[];
}

export function Habit() {
  const [isLoading, setLoading] = useState(false);
  const [dayInfo, setDayInfo] = useState<DayInfoProps | null>(null);
  const route = useRoute();
  const { date } = route.params as ParamsRoute;

  const parseDate = dayjs(date);
  const dayOfWeek = parseDate.format("dddd");
  const dayAndMonth = parseDate.format("DD/MM");

  const isDateInPast = parseDate.endOf("day").isBefore(new Date());

  const habitsProgress = dayInfo?.possibleHabits.length
    ? generateProgressPercentage(
        dayInfo.possibleHabits.length,
        dayInfo.completedHabits.length
      )
    : 0;

  async function handleToggleHabit(habitId: string) {
    try {
      await api.patch(`/habits/${habitId}/toggle`);
      if (dayInfo?.completedHabits.includes(habitId)) {
        setDayInfo({
          possibleHabits: dayInfo.possibleHabits,
          completedHabits: dayInfo.completedHabits.filter(
            (habit) => habit !== habitId
          ),
        });
      } else {
        setDayInfo({
          possibleHabits: dayInfo?.possibleHabits || [],
          completedHabits: [...(dayInfo?.completedHabits || []), habitId],
        });
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Ops",
        "Não foi possível atualizar as informações do hábito."
      );
    }
  }

  useEffect(() => {
    async function getHabit() {
      setLoading(true);
      try {
        const response = await api.get("/day", {
          params: {
            date: dayjs(date).add(3, "hours"),
          },
        });
        setDayInfo(response.data);
      } catch (error) {
        console.error(error);
        Alert.alert(
          "Ops",
          "Não foi possível carregar as informações dos hábitos"
        );
      } finally {
        setLoading(false);
      }
    }
    getHabit();
  }, []);

  if (isLoading) return <Loading />;
  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <BackButton />
        <Text className="mt-6 text-zinc-400 font-semibold text-base lowercase">
          {dayOfWeek}
        </Text>
        <Text className="text-white font-extrabold text-3xl">
          {dayAndMonth}
        </Text>
        <ProgressBar progress={habitsProgress} />
        <View
          className={clsx("mt-6", {
            ["opacity-50"]: isDateInPast,
          })}
        >
          {dayInfo?.possibleHabits
            ? dayInfo.possibleHabits.map((habit) => (
                <Checkbox
                  key={habit.id}
                  title={habit.title}
                  checked={dayInfo.completedHabits.includes(habit.id)}
                  onPress={() => handleToggleHabit(habit.id)}
                  disabled={isDateInPast}
                />
              ))
            : !isDateInPast && <HabitEmpty />}
        </View>
        {isDateInPast && (
          <Text className="text-white mt-10 text-center">
            Você não pode editar hábitos de uma data passada.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
