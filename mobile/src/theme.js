import { Platform } from "react-native";

export const colors = {
  primary: "#F59E0B",
  primaryDark: "#D97706",
  primarySoft: "#FEF3C7",
  primaryGlow: "#FDE68A",
  ink: "#101828",
  inkMuted: "#475467",
  inkSubtle: "#98A2B3",
  border: "#E4E7EC",
  borderStrong: "#98A2B3",
  field: "#F8FAFC",
  lavender: "#EEF0FB",
  lavenderStrong: "#E0E4F7",
  white: "#FFFFFF",
  green: "#16A34A",
  greenSoft: "#BBF7D0",
  greenBar: "#84CC16",
  red: "#DC2626",
  redSoft: "#FEE4E2",
  orange: "#F97316",
};

export const shadow = {
  card: Platform.select({
    ios: {
      shadowColor: "#101828",
      shadowOpacity: 0.08,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
    },
    default: { elevation: 3 },
  }),
  button: Platform.select({
    ios: {
      shadowColor: "#F59E0B",
      shadowOpacity: 0.35,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
    },
    default: { elevation: 4 },
  }),
};
