import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { colors } from "../theme";
import {
  BackButton,
  FadeIn,
  Icon,
  PrimaryButton,
  ScalePress,
  StepIndicator,
  TitleWithLogo,
  WarmGlow,
} from "../components/ui";
import { calculateBMI, saveMobileOnboarding } from "../services/authService";

const HOUSEHOLDS = [
  {
    id: "just_me",
    title: "Just me",
    desc: "Meals and portions for one",
    image: require("../../assets/cook-just-me.png"),
  },
  {
    id: "for_two",
    title: "For two",
    desc: "Meals and portions for a pair",
    image: require("../../assets/cook-for-two.png"),
  },
  {
    id: "family",
    title: "My family",
    desc: "Meals for the whole household",
    image: require("../../assets/cook-family.png"),
  },
];

const GOALS = [
  { id: "get_inspired", label: "Get inspired", icon: "lightbulb-outline" },
  { id: "learn_to_cook", label: "Learn to cook", icon: "chef-hat" },
  { id: "save_money", label: "Save money", icon: "piggy-bank-outline" },
  { id: "less_waste", label: "Less food waste", icon: "trash-can-outline" },
  { id: "eat_healthy", label: "Eat Healthy", icon: "carrot" },
  { id: "quick_easy", label: "Quick and Easy", icon: "clock-outline" },
];

const DIETS = ["No Pork", "Halal", "Peanut-free", "Dairy-free", "Vegetarian"];

const WEIGHT_GOALS = [
  { id: "maintain", label: "Maintain", icon: "scale-balance" },
  { id: "gain", label: "Gain", icon: "trending-up" },
  { id: "lose", label: "Lose", icon: "fire" },
];

export default function OnboardingScreen({ user, profile, onExit, onDone }) {
  const { width } = useWindowDimensions();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    household: "just_me",
    goals: [],
    dietaryRestrictions: [],
    gender: profile?.gender || "female",
    age: 28,
    heightCm: 165,
    weightKg: 62,
    weightGoal: "maintain",
  });
  const set = (patch) => setData((d) => ({ ...d, ...patch }));
  const toggleIn = (key, id) =>
    setData((d) => ({
      ...d,
      [key]: d[key].includes(id)
        ? d[key].filter((x) => x !== id)
        : [...d[key], id],
    }));

  // Horizontal slide between steps
  const slide = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(slide, {
      toValue: step,
      duration: 380,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [step, slide]);

  const back = () => (step === 0 ? onExit() : setStep((s) => s - 1));
  const next = async () => {
    if (step < 2) return setStep((s) => s + 1);
    setSaving(true);
    try {
      await saveMobileOnboarding(user.uid, data);
      onDone();
    } catch (e) {
      Alert.alert("Couldn't save", e.message);
      setSaving(false);
    }
  };

  const footers = [
    "Step 1 of 3 • You can update this anytime in Settings",
    "Step 2 of 3 • You can customize your preferences anytime in Settings",
    "Step 3 of 3 • You can customize your preferences anytime in Settings",
  ];

  return (
    <SafeAreaView style={styles.container}>
      <WarmGlow size={460} style={{ top: -200, right: -200 }} />
      <View style={styles.topRow}>
        <BackButton onPress={back} />
        <StepIndicator step={step + 1} total={3} />
      </View>

      <View style={{ flex: 1, overflow: "hidden" }}>
        <Animated.View
          style={{
            flexDirection: "row",
            width: width * 3,
            flex: 1,
            transform: [
              {
                translateX: slide.interpolate({
                  inputRange: [0, 1, 2],
                  outputRange: [0, -width, -width * 2],
                }),
              },
            ],
          }}
        >
          <View style={{ width }}>
            <HouseholdStep
              value={data.household}
              onChange={(household) => set({ household })}
              active={step === 0}
            />
          </View>
          <View style={{ width }}>
            <GoalsStep data={data} toggleIn={toggleIn} active={step === 1} />
          </View>
          <View style={{ width }}>
            <HealthStep data={data} set={set} active={step === 2} />
          </View>
        </Animated.View>
      </View>

      <View style={{ paddingHorizontal: 24, paddingBottom: 10 }}>
        <PrimaryButton title="Continue" onPress={next} loading={saving} />
        <Text style={styles.footer}>{footers[step]}</Text>
      </View>
    </SafeAreaView>
  );
}

/* --------------------------- Step 1 --------------------------- */

function HouseholdStep({ value, onChange, active }) {
  return (
    <ScrollView
      contentContainerStyle={styles.stepScroll}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.bigTitle}>Who are you cooking for?</Text>
      <Text style={styles.subtitle}>
        Help us customize homestyle recipes and portion sizes for your home.
      </Text>
      {HOUSEHOLDS.map((h, i) => (
        <FadeIn key={h.id + active} delay={active ? 80 + i * 90 : 0}>
          <SelectCard
            selected={value === h.id}
            onPress={() => onChange(h.id)}
            style={styles.householdCard}
          >
            <View style={styles.householdImgBox}>
              <Image
                source={h.image}
                style={{ width: 72, height: 72 }}
                resizeMode="contain"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{h.title}</Text>
              <Text style={styles.cardDesc}>{h.desc}</Text>
            </View>
          </SelectCard>
        </FadeIn>
      ))}
    </ScrollView>
  );
}

/* --------------------------- Step 2 --------------------------- */

function GoalsStep({ data, toggleIn, active }) {
  return (
    <ScrollView
      contentContainerStyle={styles.stepScroll}
      showsVerticalScrollIndicator={false}
    >
      <TitleWithLogo title="Set your goals & preferences" />
      <Text style={styles.subtitle}>
        Tailor your Pinoy meal plans to your nutritional targets and family budget.
      </Text>
      <View style={styles.grid}>
        {GOALS.map((g, i) => {
          const sel = data.goals.includes(g.id);
          return (
            <FadeIn
              key={g.id + active}
              delay={active ? 60 + i * 50 : 0}
              style={styles.gridItem}
            >
              <SelectCard
                selected={sel}
                onPress={() => toggleIn("goals", g.id)}
                style={styles.goalCard}
              >
                <Icon
                  name={g.icon}
                  size={28}
                  color={sel ? colors.primaryDark : colors.inkSubtle}
                />
                <Text style={[styles.goalText, sel && { color: colors.ink }]}>
                  {g.label}
                </Text>
              </SelectCard>
            </FadeIn>
          );
        })}
      </View>
      <Text style={styles.sectionLabel}>DIETARY RESTRICTIONS</Text>
      <View style={styles.chips}>
        {DIETS.map((d) => {
          const sel = data.dietaryRestrictions.includes(d);
          return (
            <ScalePress
              key={d}
              onPress={() => toggleIn("dietaryRestrictions", d)}
              style={[styles.chip, sel && styles.chipSel]}
            >
              {sel ? (
                <Icon
                  name="check"
                  size={12}
                  color={colors.primaryDark}
                  style={{ marginRight: 4 }}
                />
              ) : null}
              <Text
                style={[
                  styles.chipText,
                  sel && { color: colors.primaryDark, fontWeight: "700" },
                ]}
              >
                {d}
              </Text>
            </ScalePress>
          );
        })}
      </View>
    </ScrollView>
  );
}

/* --------------------------- Step 3 --------------------------- */

function HealthStep({ data, set }) {
  const [editing, setEditing] = useState(null);
  const { bmi } = useMemo(
    () => calculateBMI(data.heightCm, data.weightKg),
    [data.heightCm, data.weightKg]
  );
  const range =
    bmi < 18.5
      ? { label: "Underweight", bg: "#DBEAFE", fg: "#1D4ED8" }
      : bmi < 25
      ? { label: "Healthy range", bg: "#BEF264", fg: "#15803D" }
      : bmi < 30
      ? { label: "Overweight", bg: "#FFEDD5", fg: colors.orange }
      : { label: "Obese", bg: colors.redSoft, fg: colors.red };

  return (
    <ScrollView
      contentContainerStyle={styles.stepScroll}
      showsVerticalScrollIndicator={false}
    >
      <TitleWithLogo title="Let's set your health goals" />
      <Text style={styles.subtitle}>
        We'll use this to work out your daily calories. You can change it anytime.
      </Text>

      <View style={styles.row}>
        {[
          ["female", "Female", "gender-female"],
          ["male", "Male", "gender-male"],
        ].map(([id, label, icon]) => {
          const sel = data.gender === id;
          return (
            <SelectCard
              key={id}
              selected={sel}
              onPress={() => set({ gender: id })}
              style={styles.genderCard}
            >
              <View
                style={[
                  styles.roundIcon,
                  sel && { backgroundColor: colors.primarySoft },
                ]}
              >
                <Icon
                  name={icon}
                  size={22}
                  color={sel ? colors.primaryDark : colors.ink}
                />
              </View>
              <Text style={styles.cardTitleSm}>{label}</Text>
            </SelectCard>
          );
        })}
      </View>

      <View style={styles.row}>
        {[
          ["age", "AGE", "yrs"],
          ["heightCm", "HEIGHT", "cm"],
          ["weightKg", "WEIGHT", "kg"],
        ].map(([key, label, unit]) => (
          <ScalePress
            key={key}
            onPress={() => setEditing(key)}
            style={styles.metricCard}
          >
            <Text style={styles.metricLabel}>{label}</Text>
            <Text style={styles.metricValue}>
              {data[key]} <Text style={styles.metricUnit}>{unit}</Text>
            </Text>
          </ScalePress>
        ))}
      </View>

      <BmiCard bmi={bmi} range={range} />

      <View style={styles.row}>
        {WEIGHT_GOALS.map((g) => {
          const sel = data.weightGoal === g.id;
          return (
            <SelectCard
              key={g.id}
              selected={sel}
              onPress={() => set({ weightGoal: g.id })}
              style={styles.wgCard}
            >
              <View
                style={[
                  styles.roundIconSm,
                  sel && { backgroundColor: colors.primarySoft },
                ]}
              >
                <Icon
                  name={g.icon}
                  size={18}
                  color={sel ? colors.primaryDark : colors.ink}
                />
              </View>
              <Text style={styles.cardTitleSm}>{g.label}</Text>
            </SelectCard>
          );
        })}
      </View>

      <MetricEditor
        field={editing}
        value={editing ? data[editing] : 0}
        onClose={() => setEditing(null)}
        onSave={(v) => {
          set({ [editing]: v });
          setEditing(null);
        }}
      />
    </ScrollView>
  );
}

const BMI_MIN = 14;
const BMI_MAX = 40;

function BmiCard({ bmi, range }) {
  const [w, setW] = useState(0);
  const pos = useRef(new Animated.Value(0)).current;
  const pct = Math.min(1, Math.max(0, (bmi - BMI_MIN) / (BMI_MAX - BMI_MIN)));
  useEffect(() => {
    Animated.spring(pos, {
      toValue: pct * w,
      friction: 7,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [pct, w, pos]);

  const segs = [
    [18.5 - BMI_MIN, "#E0E7FF", "Under"],
    [25 - 18.5, "#65A30D", "Healthy"],
    [30 - 25, colors.primary, "Over"],
    [BMI_MAX - 30, colors.red, "Obese"],
  ];

  return (
    <View style={styles.bmiCard}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View>
          <Text style={styles.bmiLabel}>Your BMI</Text>
          <Text style={styles.bmiValue}>{bmi || "--"}</Text>
        </View>
        <View style={[styles.rangePill, { backgroundColor: range.bg }]}>
          <Icon name="check-circle" size={13} color={range.fg} />
          <Text style={[styles.rangeText, { color: range.fg }]}>
            {range.label}
          </Text>
        </View>
      </View>
      <View
        style={{ marginTop: 18 }}
        onLayout={(e) => setW(e.nativeEvent.layout.width)}
      >
        <Animated.View
          style={[
            styles.marker,
            { transform: [{ translateX: Animated.subtract(pos, 6) }] },
          ]}
        >
          <Icon name="menu-down" size={18} color={colors.ink} />
        </Animated.View>
        <View style={styles.bar}>
          {segs.map(([flex, color], i) => (
            <View
              key={i}
              style={{
                flex,
                backgroundColor: color,
                marginRight: i < 3 ? 2 : 0,
              }}
            />
          ))}
        </View>
        <View style={{ flexDirection: "row", marginTop: 6 }}>
          {segs.map(([flex, , label]) => (
            <Text
              key={label}
              style={[
                styles.segLabel,
                { flex },
                label === "Healthy" &&
                  range.label === "Healthy range" && {
                    color: "#15803D",
                    fontWeight: "700",
                  },
              ]}
            >
              {label}
            </Text>
          ))}
        </View>
      </View>
      <Text style={styles.disclaimer}>ⓘ A guide, not a medical diagnosis.</Text>
    </View>
  );
}

const LIMITS = {
  age: { min: 10, max: 120, step: 1, label: "Age", unit: "yrs" },
  heightCm: { min: 50, max: 250, step: 1, label: "Height", unit: "cm" },
  weightKg: { min: 20, max: 300, step: 1, label: "Weight", unit: "kg" },
};

function MetricEditor({ field, value, onClose, onSave }) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value, field]);
  if (!field) return null;
  const lim = LIMITS[field];
  const num = parseFloat(text) || 0;
  const bump = (d) =>
    setText(String(Math.min(lim.max, Math.max(lim.min, num + d))));
  const valid = num >= lim.min && num <= lim.max;
  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <View style={styles.modalBg}>
        <FadeIn from={40} style={styles.modalCard}>
          <Text style={styles.modalTitle}>{lim.label}</Text>
          <View style={styles.stepperRow}>
            <ScalePress onPress={() => bump(-lim.step)} style={styles.stepBtn}>
              <Icon name="minus" size={20} color={colors.ink} />
            </ScalePress>
            <TextInput
              value={text}
              onChangeText={(t) => setText(t.replace(/[^0-9.]/g, ""))}
              keyboardType="decimal-pad"
              style={styles.stepInput}
              autoFocus
              selectTextOnFocus
            />
            <Text style={styles.stepUnit}>{lim.unit}</Text>
            <ScalePress onPress={() => bump(lim.step)} style={styles.stepBtn}>
              <Icon name="plus" size={20} color={colors.ink} />
            </ScalePress>
          </View>
          {!valid ? (
            <Text style={styles.modalError}>
              Enter a value between {lim.min} and {lim.max}.
            </Text>
          ) : null}
          <PrimaryButton
            title="Save"
            icon="check"
            disabled={!valid}
            onPress={() => onSave(num)}
            style={{ marginTop: 16 }}
          />
          <ScalePress
            onPress={onClose}
            style={{ alignSelf: "center", padding: 12 }}
          >
            <Text style={{ color: colors.inkMuted }}>Cancel</Text>
          </ScalePress>
        </FadeIn>
      </View>
    </Modal>
  );
}

/* --------------------------- Shared --------------------------- */

function SelectCard({ selected, onPress, style, children }) {
  const v = useRef(new Animated.Value(selected ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: selected ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [selected, v]);
  return (
    <ScalePress onPress={onPress}>
      <Animated.View
        style={[
          styles.selectBase,
          style,
          {
            borderColor: v.interpolate({
              inputRange: [0, 1],
              outputRange: [colors.border, colors.primary],
            }),
            backgroundColor: v.interpolate({
              inputRange: [0, 1],
              outputRange: ["#ffffff", "#FFFBEB"],
            }),
          },
        ]}
      >
        {children}
        {selected ? (
          <View style={styles.selCheck}>
            <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>
              ✓
            </Text>
          </View>
        ) : null}
      </Animated.View>
    </ScalePress>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", overflow: "hidden" },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 6,
    marginBottom: 8,
  },
  stepScroll: { paddingHorizontal: 24, paddingBottom: 24 },
  bigTitle: {
    fontSize: 25,
    fontWeight: "800",
    color: colors.ink,
    textAlign: "center",
    marginTop: 6,
  },
  subtitle: {
    fontSize: 13.5,
    color: colors.inkMuted,
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 16,
  },
  selectBase: {
    borderWidth: 1.4,
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  selCheck: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  householdCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginBottom: 14,
    shadowColor: "#101828",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  householdImgBox: {
    width: 82,
    height: 82,
    borderRadius: 14,
    backgroundColor: "#F4F6FB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  cardTitle: { fontSize: 19, fontWeight: "800", color: colors.ink },
  cardDesc: {
    fontSize: 13.5,
    color: colors.inkMuted,
    marginTop: 4,
    lineHeight: 19,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: { width: "48%", marginBottom: 12 },
  goalCard: {
    height: 106,
    alignItems: "center",
    justifyContent: "center",
    borderColor: colors.borderStrong,
  },
  goalText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    color: colors.inkMuted,
  },
  sectionLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 0.9,
    color: colors.inkMuted,
    marginTop: 6,
    marginBottom: 10,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: "#fff",
  },
  chipSel: { borderColor: colors.primary, backgroundColor: "#FFFBEB" },
  chipText: { fontSize: 13, color: colors.ink, fontWeight: "600" },
  row: { flexDirection: "row", gap: 10, marginBottom: 12 },
  genderCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    minWidth: 145,
  },
  roundIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.lavender,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  roundIconSm: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.lavender,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  cardTitleSm: { fontSize: 15, fontWeight: "700", color: colors.ink },
  metricCard: {
    flex: 1,
    borderWidth: 1.4,
    borderColor: colors.border,
    borderRadius: 16,
    alignItems: "center",
    paddingVertical: 12,
  },
  metricLabel: {
    fontSize: 11,
    letterSpacing: 0.9,
    color: colors.inkMuted,
    fontWeight: "600",
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.ink,
    marginTop: 4,
  },
  metricUnit: { fontSize: 13, fontWeight: "500", color: colors.inkMuted },
  wgCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    minWidth: 94,
  },
  bmiCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bmiLabel: { fontSize: 13, color: colors.inkMuted },
  bmiValue: { fontSize: 24, fontWeight: "800", color: colors.ink },
  rangePill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  rangeText: { marginLeft: 5, fontWeight: "700", fontSize: 12.5 },
  marker: { position: "absolute", top: -18, left: 0 },
  bar: { flexDirection: "row", height: 7, borderRadius: 4, overflow: "hidden" },
  segLabel: { fontSize: 11.5, color: colors.inkMuted, textAlign: "center" },
  disclaimer: {
    textAlign: "center",
    fontStyle: "italic",
    color: colors.inkMuted,
    fontSize: 12,
    marginTop: 10,
  },
  footer: {
    textAlign: "center",
    color: colors.inkSubtle,
    fontSize: 11.5,
    marginTop: 8,
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(16,24,40,0.45)",
    justifyContent: "center",
    padding: 28,
  },
  modalCard: { backgroundColor: "#fff", borderRadius: 24, padding: 22 },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.ink,
    textAlign: "center",
    marginBottom: 16,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.lavender,
    alignItems: "center",
    justifyContent: "center",
  },
  stepInput: {
    fontSize: 34,
    fontWeight: "800",
    color: colors.ink,
    minWidth: 86,
    textAlign: "center",
  },
  stepUnit: { fontSize: 15, color: colors.inkMuted, marginRight: 12 },
  modalError: { color: colors.red, textAlign: "center", marginTop: 10 },
});
