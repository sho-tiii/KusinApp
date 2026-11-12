import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { colors, shadow } from "../theme";
import {
  BackButton,
  ConfirmationModal,
  FadeIn,
  Icon,
  PrimaryButton,
  StepIndicator,
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

const DIETS = [
  "No Pork",
  "Halal",
  "Peanut-free",
  "Dairy-free",
  "Vegetarian",
  "Seafood-free",
  "Egg-free",
];

const COMORBIDITIES = [
  { id: "none", label: "None" },
  { id: "hypertension", label: "Hypertension (Low Sodium)" },
  { id: "diabetes", label: "Diabetes (Low Sugar)" },
  { id: "high_cholesterol", label: "High Cholesterol (Low Fat)" },
  { id: "hyperuricemia_gout", label: "Gout (Low Purine)" },
  { id: "gerd_acid_reflux", label: "Acid Reflux / GERD" },
];

const WEIGHT_GOALS = [
  { id: "maintain", label: "Maintain", icon: "scale-balance" },
  { id: "gain", label: "Gain", icon: "trending-up" },
  { id: "lose", label: "Lose", icon: "fire" },
];

export default function OnboardingScreen({ user, profile, onExit, onDone }) {
  const { width } = useWindowDimensions();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [errorModal, setErrorModal] = useState(null);

  // Start with NOTHING pre-selected so the user makes an intentional choice
  const ob = profile?.onboarding;
  const [data, setData] = useState({
    household: ob?.household || "",
    goals: Array.isArray(ob?.goals) ? ob.goals : [],
    dietaryRestrictions: Array.isArray(ob?.dietaryRestrictions) ? ob.dietaryRestrictions : [],
    comorbidities: Array.isArray(ob?.comorbidities) ? ob.comorbidities : [],
    gender: ob?.gender || "",
    age: ob?.age ? String(ob.age) : "",
    heightCm: ob?.heightCm ? String(ob.heightCm) : "",
    weightKg: ob?.weightKg ? String(ob.weightKg) : "",
    weightGoal: ob?.weightGoal || "",
  });

  const set = (patch) => setData((d) => ({ ...d, ...patch }));

  const toggleIn = (key, id) =>
    setData((d) => ({
      ...d,
      [key]: d[key].includes(id)
        ? d[key].filter((x) => x !== id)
        : [...d[key], id],
    }));

  const toggleComorbidity = (id) => {
    setData((d) => {
      if (id === "none") {
        return { ...d, comorbidities: d.comorbidities.includes("none") ? [] : ["none"] };
      }
      const withoutNone = d.comorbidities.filter((x) => x !== "none");
      const next = withoutNone.includes(id)
        ? withoutNone.filter((x) => x !== id)
        : [...withoutNone, id];
      return { ...d, comorbidities: next };
    });
  };

  const slide = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(slide, {
      toValue: step,
      duration: 360,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [step, slide]);

  const back = () => (step === 0 ? onExit() : setStep((s) => s - 1));

  const next = async () => {
    if (step === 0) {
      if (!data.household) {
        setErrorModal({
          title: "Select Your Household",
          message: "Please choose who you are cooking for before continuing.",
        });
        return;
      }
      setStep(1);
      return;
    }

    if (step === 1) {
      setStep(2);
      return;
    }

    // Validate Step 3 (Health Goals)
    if (!data.gender) {
      setErrorModal({
        title: "Biological Sex Required",
        message: "Please select Female or Male so we can accurately compute your daily calorie needs.",
      });
      return;
    }
    if (!data.age || !data.heightCm || !data.weightKg) {
      setErrorModal({
        title: "Body Metrics Required",
        message: "Please tap Age, Height, and Weight to enter your body measurements.",
      });
      return;
    }
    if (!data.weightGoal) {
      setErrorModal({
        title: "Select a Weight Goal",
        message: "Please choose whether you want to Maintain, Gain, or Lose weight.",
      });
      return;
    }

    setSaving(true);
    try {
      await saveMobileOnboarding(user.uid, data);
      onDone();
    } catch (e) {
      setErrorModal({
        title: "Couldn't Save Profile",
        message: e.message || "Please check your inputs and try again.",
      });
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
            <GoalsStep
              data={data}
              toggleIn={toggleIn}
              toggleComorbidity={toggleComorbidity}
              active={step === 1}
            />
          </View>
          <View style={{ width }}>
            <HealthStep data={data} set={set} />
          </View>
        </Animated.View>
      </View>

      <View style={{ paddingHorizontal: 24, paddingBottom: 10 }}>
        <PrimaryButton title="Continue" onPress={next} loading={saving} />
        <Text style={styles.footer}>{footers[step]}</Text>
      </View>

      <ConfirmationModal
        visible={!!errorModal}
        title={errorModal?.title || ""}
        message={errorModal?.message || ""}
        confirmText="Got it"
        cancelText=""
        onClose={() => setErrorModal(null)}
        onConfirm={() => setErrorModal(null)}
      />
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
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={() => onChange(h.id)}
            style={[
              styles.householdCard,
              value === h.id ? styles.cardActive : styles.cardInactive,
            ]}
          >
            <View style={styles.householdImgBox}>
              <Image
                source={h.image}
                style={{ width: 68, height: 68 }}
                resizeMode="contain"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{h.title}</Text>
              <Text style={styles.cardDesc}>{h.desc}</Text>
            </View>
          </TouchableOpacity>
        </FadeIn>
      ))}
    </ScrollView>
  );
}

/* --------------------------- Step 2 --------------------------- */

function GoalsStep({ data, toggleIn, toggleComorbidity, active }) {
  return (
    <ScrollView
      contentContainerStyle={styles.stepScroll}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.screenTitle}>Set your goals & preferences</Text>
      <Text style={styles.subtitle}>
        Tailor your Pinoy meal plans to your nutritional targets, allergies, and health needs.
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
              <TouchableOpacity
                activeOpacity={0.82}
                onPress={() => toggleIn("goals", g.id)}
                style={[
                  styles.goalCard,
                  sel ? styles.cardActive : styles.cardInactive,
                ]}
              >
                <Icon
                  name={g.icon}
                  size={26}
                  color={sel ? colors.primaryDark : colors.inkSubtle}
                />
                <Text
                  style={[
                    styles.goalText,
                    sel && { color: colors.ink, fontWeight: "700" },
                  ]}
                >
                  {g.label}
                </Text>
              </TouchableOpacity>
            </FadeIn>
          );
        })}
      </View>

      <Text style={styles.sectionLabel}>DIETARY RESTRICTIONS & ALLERGIES</Text>
      <View style={styles.chips}>
        {DIETS.map((d) => {
          const sel = data.dietaryRestrictions.includes(d);
          return (
            <TouchableOpacity
              key={d}
              activeOpacity={0.82}
              onPress={() => toggleIn("dietaryRestrictions", d)}
              style={[styles.chip, sel && styles.chipSel]}
            >
              {sel ? (
                <Icon
                  name="check"
                  size={12}
                  color={colors.primaryDark}
                  style={{ marginRight: 5 }}
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
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.sectionLabel, { marginTop: 18 }]}>
        HEALTH CONDITIONS (COMORBIDITIES)
      </Text>
      <View style={styles.chips}>
        {COMORBIDITIES.map((c) => {
          const sel = data.comorbidities.includes(c.id);
          return (
            <TouchableOpacity
              key={c.id}
              activeOpacity={0.82}
              onPress={() => toggleComorbidity(c.id)}
              style={[styles.chip, sel && styles.chipSel]}
            >
              {sel ? (
                <Icon
                  name="check"
                  size={12}
                  color={colors.primaryDark}
                  style={{ marginRight: 5 }}
                />
              ) : null}
              <Text
                style={[
                  styles.chipText,
                  sel && { color: colors.primaryDark, fontWeight: "700" },
                ]}
              >
                {c.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

/* --------------------------- Step 3 (Strict Grid Alignment & Unselected Initial State) --------------------------- */

function HealthStep({ data, set }) {
  const [editing, setEditing] = useState(null);
  const { bmi } = useMemo(
    () => calculateBMI(data.heightCm, data.weightKg),
    [data.heightCm, data.weightKg]
  );
  const range =
    !bmi
      ? { label: "Enter height & weight", fg: colors.inkSubtle }
      : bmi < 18.5
      ? { label: "Underweight", fg: "#1D4ED8" }
      : bmi < 25
      ? { label: "Healthy range", fg: "#15803D" }
      : bmi < 30
      ? { label: "Overweight", fg: colors.orange }
      : { label: "Obese", fg: colors.red };

  return (
    <ScrollView
      contentContainerStyle={styles.stepScroll}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.screenTitle}>Let's set your health goals</Text>
      <Text style={styles.subtitle}>
        We'll use this to work out your daily calories. You can change it anytime.
      </Text>

      {/* Row 1: Gender (Split 50 / 50, unselected by default) */}
      <View style={styles.gridRow}>
        {[
          ["female", "Female", "gender-female"],
          ["male", "Male", "gender-male"],
        ].map(([id, label, icon]) => {
          const sel = data.gender === id;
          return (
            <TouchableOpacity
              key={id}
              activeOpacity={0.82}
              onPress={() => set({ gender: id })}
              style={[
                styles.gridCell,
                styles.genderBox,
                sel ? styles.cardActive : styles.cardInactive,
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  sel && { backgroundColor: colors.primarySoft },
                ]}
              >
                <Icon
                  name={icon}
                  size={20}
                  color={sel ? colors.primaryDark : colors.ink}
                />
              </View>
              <Text
                style={[
                  styles.cardTitleSm,
                  sel && { color: colors.primaryDark },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Row 2: Metrics (Split 1/3, 1/3, 1/3, empty placeholder until tapped) */}
      <View style={styles.gridRow}>
        {[
          ["age", "AGE", "yrs"],
          ["heightCm", "HEIGHT", "cm"],
          ["weightKg", "WEIGHT", "kg"],
        ].map(([key, label, unit]) => {
          const hasVal = Boolean(data[key]);
          return (
            <TouchableOpacity
              key={key}
              activeOpacity={0.82}
              onPress={() => setEditing(key)}
              style={[
                styles.gridCell,
                styles.metricBox,
                hasVal && { borderColor: colors.primary, backgroundColor: "#FFFBEB" },
              ]}
            >
              <Text style={styles.metricLabel}>{label}</Text>
              <Text
                style={[
                  styles.metricValue,
                  !hasVal && { color: colors.inkSubtle },
                ]}
              >
                {hasVal ? data[key] : "—"}{" "}
                <Text style={styles.metricUnit}>{unit}</Text>
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Row 3: BMI Card */}
      <BmiCard bmi={bmi} range={range} />

      {/* Row 4: Weight Goal (Split 1/3, 1/3, 1/3, unselected by default) */}
      <View style={styles.gridRow}>
        {WEIGHT_GOALS.map((g) => {
          const sel = data.weightGoal === g.id;
          return (
            <TouchableOpacity
              key={g.id}
              activeOpacity={0.82}
              onPress={() => set({ weightGoal: g.id })}
              style={[
                styles.gridCell,
                styles.goalBox,
                sel ? styles.cardActive : styles.cardInactive,
              ]}
            >
              <View
                style={[
                  styles.iconCircleSm,
                  sel && { backgroundColor: colors.primarySoft },
                ]}
              >
                <Icon
                  name={g.icon}
                  size={16}
                  color={sel ? colors.primaryDark : colors.ink}
                />
              </View>
              <Text
                style={[
                  styles.cardTitleSm,
                  sel && { color: colors.primaryDark },
                ]}
              >
                {g.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <MetricEditor
        field={editing}
        value={editing ? data[editing] : ""}
        onClose={() => setEditing(null)}
        onSave={(v) => {
          set({ [editing]: String(v) });
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
  const pct = bmi
    ? Math.min(1, Math.max(0, (bmi - BMI_MIN) / (BMI_MAX - BMI_MIN)))
    : 0;
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
          <Text style={styles.bmiValue}>{bmi || "—"}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.bmiStatusText, { color: range.fg }]}>
            ● {range.label}
          </Text>
        </View>
      </View>

      <View
        style={{ marginTop: 16 }}
        onLayout={(e) => setW(e.nativeEvent.layout.width)}
      >
        {bmi > 0 ? (
          <Animated.View
            style={[
              styles.marker,
              { transform: [{ translateX: Animated.subtract(pos, 6) }] },
            ]}
          >
            <Icon name="chevron-down" size={14} color={colors.ink} />
          </Animated.View>
        ) : null}
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
  age: { min: 10, max: 120, step: 1, defaultVal: 25, label: "Age", unit: "yrs" },
  heightCm: { min: 50, max: 250, step: 1, defaultVal: 165, label: "Height", unit: "cm" },
  weightKg: { min: 20, max: 300, step: 1, defaultVal: 60, label: "Weight", unit: "kg" },
};

function MetricEditor({ field, value, onClose, onSave }) {
  const lim = field ? LIMITS[field] : null;
  const [text, setText] = useState("");

  useEffect(() => {
    if (!field || !lim) return;
    setText(value ? String(value) : String(lim.defaultVal));
  }, [value, field, lim]);

  if (!field || !lim) return null;

  const num = parseFloat(text) || 0;
  const bump = (d) =>
    setText(String(Math.min(lim.max, Math.max(lim.min, (num || lim.defaultVal) + d))));
  const valid = num >= lim.min && num <= lim.max;

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={styles.modalBg}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {}}
          style={styles.modalCard}
        >
          <View style={styles.modalHeaderRow}>
            <Text style={styles.modalTitle}>Set {lim.label}</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.modalCloseBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close" size={18} color={colors.inkMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.stepperRow}>
            <TouchableOpacity onPress={() => bump(-lim.step)} style={styles.stepBtn}>
              <Icon name="minus" size={20} color={colors.ink} />
            </TouchableOpacity>
            <TextInput
              value={text}
              onChangeText={(t) => setText(t.replace(/[^0-9.]/g, ""))}
              keyboardType="decimal-pad"
              style={styles.stepInput}
              autoFocus
              selectTextOnFocus
            />
            <Text style={styles.stepUnit}>{lim.unit}</Text>
            <TouchableOpacity onPress={() => bump(lim.step)} style={styles.stepBtn}>
              <Icon name="plus" size={20} color={colors.ink} />
            </TouchableOpacity>
          </View>

          {!valid ? (
            <Text style={styles.modalError}>
              Enter a value between {lim.min} and {lim.max} {lim.unit}.
            </Text>
          ) : null}

          <View style={styles.modalActionRow}>
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={onClose}
              style={styles.modalCancelBtn}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={!valid}
              onPress={() => onSave(num)}
              style={[
                styles.modalSaveBtn,
                !valid && { opacity: 0.5 },
              ]}
            >
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 6,
    marginBottom: 8,
  },
  stepScroll: { paddingHorizontal: 24, paddingBottom: 24 },
  screenTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 4,
  },
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
  cardActive: {
    borderColor: colors.primary,
    backgroundColor: "#FFFBEB",
    borderWidth: 1.6,
  },
  cardInactive: {
    borderColor: colors.border,
    backgroundColor: "#fff",
    borderWidth: 1.2,
  },
  householdCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginBottom: 12,
    borderRadius: 16,
  },
  householdImgBox: {
    width: 76,
    height: 76,
    borderRadius: 12,
    backgroundColor: "#F4F6FB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  cardTitle: { fontSize: 18, fontWeight: "800", color: colors.ink },
  cardDesc: {
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: 3,
    lineHeight: 18,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: { width: "48%", marginBottom: 10 },
  goalCard: {
    height: 94,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  goalText: {
    marginTop: 8,
    fontSize: 13.5,
    fontWeight: "600",
    color: colors.inkMuted,
  },
  sectionLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 0.9,
    color: colors.inkMuted,
    marginTop: 8,
    marginBottom: 10,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.2,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  chipSel: { borderColor: colors.primary, backgroundColor: "#FFFBEB" },
  chipText: { fontSize: 13, color: colors.ink, fontWeight: "600" },

  // Strict Grid Row & Cell
  gridRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
    width: "100%",
  },
  gridCell: {
    flex: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  genderBox: {
    paddingVertical: 14,
    minHeight: 96,
  },
  metricBox: {
    borderWidth: 1.2,
    borderColor: colors.border,
    backgroundColor: "#fff",
    paddingVertical: 12,
    minHeight: 74,
  },
  goalBox: {
    paddingVertical: 14,
    minHeight: 96,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.lavender,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  iconCircleSm: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.lavender,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  cardTitleSm: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
    textAlign: "center",
  },
  metricLabel: {
    fontSize: 11,
    letterSpacing: 0.8,
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

  bmiCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.2,
    borderColor: colors.border,
  },
  bmiLabel: { fontSize: 13, color: colors.inkMuted },
  bmiValue: { fontSize: 24, fontWeight: "800", color: colors.ink },
  bmiStatusText: { fontWeight: "700", fontSize: 13 },
  marker: { position: "absolute", top: -14, left: 0 },
  bar: { flexDirection: "row", height: 7, borderRadius: 4, overflow: "hidden" },
  segLabel: { fontSize: 11, color: colors.inkMuted, textAlign: "center" },
  disclaimer: {
    textAlign: "center",
    fontStyle: "italic",
    color: colors.inkMuted,
    fontSize: 11.5,
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
    backgroundColor: "rgba(16, 24, 40, 0.48)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
    ...shadow.card,
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.ink,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  stepBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.lavender,
    alignItems: "center",
    justifyContent: "center",
  },
  stepInput: {
    width: 100,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    color: colors.ink,
  },
  stepUnit: { fontSize: 15, color: colors.inkMuted, fontWeight: "600" },
  modalError: {
    color: colors.red,
    textAlign: "center",
    marginTop: 10,
    fontSize: 12.5,
  },
  modalActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
  },
  modalCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: colors.border,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: colors.inkMuted,
  },
  modalSaveBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSaveText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#fff",
  },
});
