import { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { BackButton } from "../components/BackButton";
import { Checkbox } from "../components/Checkbox";

import colors from "tailwindcss/colors";
import { api } from "../lib/axios";

const avaiableWeekDays = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sabádo",
];

export function New() {
  const [weekDays, setWeekDays] = useState<number[]>([]);
  const [title, setTitle] = useState("");

  function handleToggleWeekDay(weekDayIndex: number) {
    if (weekDays.includes(weekDayIndex)) {
      setWeekDays((oldState) =>
        oldState.filter((weekDay) => weekDay !== weekDayIndex)
      );
    } else {
      setWeekDays((oldState) => [...oldState, weekDayIndex]);
    }
  }

  async function handleCreateNewHabit() {
    try {
      if (!title.trim())
        return Alert.alert("Novo Hábito", "Informe o nome do hábito.");
      if (weekDays.length === 0)
        return Alert.alert(
          "Novo Hábito",
          "Informe pelo menos uma recorrência."
        );

      await api.post("/habits", { title, weekDays });
      setTitle("");
      setWeekDays([]);
      Alert.alert("Novo Hábito", "Hábito criado com sucesso!.");
    } catch (error) {
      Alert.alert("Ops", "Não foi possível criar o novo hábito.");
      console.error(error);
    }
  }

  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
      >
        <BackButton />
        <Text className="mt-6 text-white font-extrabold text-3xl">
          Criar hábito
        </Text>
        <Text className="mt-6 text-white font-semibold text-base">
          Qual o seu compromentimento?
        </Text>
        <TextInput
          className="h-12 pl-4 rounded-lg mt-3 bg-zinc-900 text-white border-2 border-zinc-800 focus:border-green-600"
          placeholder="Exercícios, dormir bem, etc..."
          placeholderTextColor={colors.zinc[400]}
          value={title}
          onChangeText={setTitle}
        />

        <Text className="font-semibold mt-4 mb-3 text-white text-base">
          Qual a recorrência?
        </Text>
        {avaiableWeekDays.map((weekday, index) => (
          <Checkbox
            key={weekday}
            title={weekday}
            checked={weekDays.includes(index)}
            onPress={() => handleToggleWeekDay(index)}
          />
        ))}
        <TouchableOpacity
          activeOpacity={0.7}
          className="w-full h-14 flex-row items-center justify-center bg-green-600 rounded-md mt-6"
        >
          <Feather name="check" size={20} color={colors.white} />
          <Text
            className="font-semibold text-base text-white ml-2"
            onPress={handleCreateNewHabit}
          >
            Confirmar
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
