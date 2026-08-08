import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import { useQuery } from "@apollo/client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ARTISTRY_COMPONENTS_QUERY,
  BASES_QUERY,
  BODY_ELEMENTS_QUERY,
  DA_CRITERIA_QUERY,
  R_CRITERIA_QUERY,
  ROTATIONS_QUERY,
} from "../../graphql/queries";
import type {
  Apparatus,
  RoutineItem,
  RoutineItemType,
} from "../../types/routine";
import { getRoutineItemTypeLabel, TIMELINE_TYPE_COLORS } from "../../types/routine";
import { formatCopValue } from "../../utils/formatCopValue";
import {
  MIN_BASE_ROTATIONS,
  THROW_AFTER_ROLL_ON_FLOOR_ID,
  validateRiskComposition,
  WITHOUT_HANDS_CATCH_ID,
  WITHOUT_HANDS_THROW_ID,
  isDirectCatchCriterion,
  isWithoutHandsIncompatibleCatch,
} from "../../utils/riskValidation";
import {
  CATCH_FROM_HIGH_THROW_BASE_ID,
  isAlternateCatchBase,
  validateMasteryBaseCombination,
} from "../../utils/masteryValidation";
import {
  compactListboxSlotProps,
  renderCompactAutocompleteInput,
  renderCompactOption,
} from "./compactPickerStyles";
import {
  DraggableItemInventory,
  RotationPicker,
  type InventoryItem,
} from "./DraggableItemInventory";

const ROTATION_CRITERION_ID = "rotation";
const ROTATION_R_CRITERION_ID = "rotation";
const DEFAULT_RISK_ROTATION_SLOTS = ["", ""] as const;

interface BaseOption {
  id: string;
  name: string;
  value: number;
  apparatuses: string[];
  allowedCriteria: string[];
}

interface CriteriaOption {
  id: string;
  name: string;
}

interface RCriteriaOption {
  id: string;
  name: string;
  type: string;
  value: number;
}

export interface EditingPanelSubmitPayload {
  bodyElementId?: string;
  artistryComponentId?: string;
  risk?: {
    criteriaIds: string[];
    rotations: Array<{ rotationId: string; count: number }>;
  };
  mastery?: {
    baseIds: string[];
    criteriaIds: string[];
    rotationId?: string;
  };
}

interface InventoryPanelProps {
  apparatus: Apparatus;
  mode: "idle" | "add" | "edit";
  itemType: RoutineItemType | null;
  selectedItem: RoutineItem | null;
  onStartAdd: (type: RoutineItemType) => void;
  onBack: () => void;
  onSubmit: (payload: EditingPanelSubmitPayload) => Promise<void>;
  onAddBodyElement: (bodyElementId: string) => Promise<void>;
  onAddArtistry: (artistryComponentId: string) => Promise<void>;
  busy: boolean;
  hiddenInventoryDragId?: string | null;
}

export function InventoryPanel({
  apparatus,
  mode,
  itemType,
  selectedItem,
  onStartAdd,
  onBack,
  onSubmit,
  onAddBodyElement,
  onAddArtistry,
  busy,
  hiddenInventoryDragId = null,
}: InventoryPanelProps) {
  const { data: bodyElementsData } = useQuery(BODY_ELEMENTS_QUERY);
  const { data: basesData } = useQuery(BASES_QUERY, { variables: { apparatus } });
  const { data: daCriteriaData } = useQuery(DA_CRITERIA_QUERY);
  const { data: rCriteriaData } = useQuery(R_CRITERIA_QUERY, { variables: { apparatus } });
  const { data: rotationsData } = useQuery(ROTATIONS_QUERY);
  const { data: artistryData } = useQuery(ARTISTRY_COMPONENTS_QUERY);

  const bodyElements = bodyElementsData?.bodyElements ?? [];
  const bases = basesData?.bases ?? [];
  const daCriteria = daCriteriaData?.daCriteria ?? [];
  const rCriteria = rCriteriaData?.rCriteria ?? [];
  const rotations = rotationsData?.rotations ?? [];
  const artistryComponents = artistryData?.artistryComponents ?? [];

  const activeType = mode === "edit" ? selectedItem?.type : itemType;

  const [throwCriteriaIds, setThrowCriteriaIds] = useState<string[]>([]);
  const [catchCriteriaIds, setCatchCriteriaIds] = useState<string[]>([]);
  const [generalCriteriaIds, setGeneralCriteriaIds] = useState<string[]>([]);
  const [riskRotationIds, setRiskRotationIds] = useState<string[]>([...DEFAULT_RISK_ROTATION_SLOTS]);
  const [masteryBaseIds, setMasteryBaseIds] = useState<string[]>([]);
  const [masteryCriteriaIds, setMasteryCriteriaIds] = useState<string[]>([]);
  const [masteryRotationId, setMasteryRotationId] = useState("");
  const [masteryBasesOpen, setMasteryBasesOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const throwCriteria = useMemo(
    () => rCriteria.filter((c: RCriteriaOption) => c.type === "throw"),
    [rCriteria],
  );
  const catchCriteria = useMemo(
    () => rCriteria.filter((c: RCriteriaOption) => c.type === "catch"),
    [rCriteria],
  );
  const generalCriteria = useMemo(
    () =>
      rCriteria.filter(
        (c: RCriteriaOption) => c.type === "general" && c.id !== ROTATION_R_CRITERION_ID,
      ),
    [rCriteria],
  );

  useEffect(() => {
    if (mode !== "add" || !itemType) {
      return;
    }
    setFormError(null);
    setThrowCriteriaIds([]);
    setCatchCriteriaIds([]);
    setGeneralCriteriaIds([]);
    setRiskRotationIds([...DEFAULT_RISK_ROTATION_SLOTS]);
    setMasteryBaseIds([]);
    setMasteryCriteriaIds([]);
    setMasteryRotationId("");
  }, [mode, itemType]);

  useEffect(() => {
    if (mode !== "edit" || !selectedItem) {
      return;
    }
    setFormError(null);
    const criteria = selectedItem.risk?.criteriaIds ?? [];
    setThrowCriteriaIds(
      criteria.filter((id) => throwCriteria.some((c: RCriteriaOption) => c.id === id)),
    );
    setCatchCriteriaIds(
      criteria.filter((id) => catchCriteria.some((c: RCriteriaOption) => c.id === id)),
    );
    setGeneralCriteriaIds(
      criteria.filter((id) => generalCriteria.some((c: RCriteriaOption) => c.id === id)),
    );
    setRiskRotationIds(
      (() => {
        const ids =
          selectedItem.risk?.rotations.flatMap((r) =>
            Array.from({ length: r.count }, () => r.rotationId),
          ) ?? [];
        while (ids.length < MIN_BASE_ROTATIONS) {
          ids.push("");
        }
        return ids;
      })(),
    );
    setMasteryBaseIds(selectedItem.mastery?.baseIds ?? []);
    setMasteryCriteriaIds(selectedItem.mastery?.criteriaIds ?? []);
    setMasteryRotationId(selectedItem.mastery?.rotationId ?? "");
  }, [mode, selectedItem, throwCriteria, catchCriteria, generalCriteria]);

  const allowedMasteryCriteria = useMemo(() => {
    if (masteryBaseIds.length === 0) {
      return [];
    }
    const allowed = new Set<string>();
    for (const baseId of masteryBaseIds) {
      const base = bases.find((b: BaseOption) => b.id === baseId);
      base?.allowedCriteria.forEach((id: string) => allowed.add(id));
    }
    return daCriteria.filter((c: CriteriaOption) => allowed.has(c.id));
  }, [masteryBaseIds, bases, daCriteria]);

  const selectableMasteryBases = useMemo(() => {
    if (masteryBaseIds.length >= 2) {
      return bases.filter((b: BaseOption) => masteryBaseIds.includes(b.id));
    }
    if (masteryBaseIds.length === 1) {
      const [first] = masteryBaseIds;
      if (isAlternateCatchBase(first)) {
        return bases.filter((b: BaseOption) => masteryBaseIds.includes(b.id));
      }
      if (first === CATCH_FROM_HIGH_THROW_BASE_ID) {
        return bases.filter((b: BaseOption) => !isAlternateCatchBase(b.id));
      }
      return bases.filter(
        (b: BaseOption) =>
          masteryBaseIds.includes(b.id) || b.id === CATCH_FROM_HIGH_THROW_BASE_ID,
      );
    }
    return bases;
  }, [bases, masteryBaseIds]);

  const masteryBaseHint = useMemo(() => {
    if (masteryBaseIds.length >= 2) {
      return null;
    }
    if (masteryBaseIds.length === 1 && isAlternateCatchBase(masteryBaseIds[0])) {
      return "This catch base stands alone — use 1 base + 2 criteria (cannot pair with Catch from a High Throw).";
    }
    if (masteryBaseIds.length === 1 && masteryBaseIds[0] !== CATCH_FROM_HIGH_THROW_BASE_ID) {
      return "To add a second base, choose Catch from a High Throw.";
    }
    return null;
  }, [masteryBaseIds]);

  const showMasteryRotation = masteryCriteriaIds.includes(ROTATION_CRITERION_ID);
  const showBodyInventory =
    (mode === "add" && itemType === "body_element") ||
    (mode === "edit" && selectedItem?.type === "body_element");
  const showArtistryInventory =
    (mode === "add" && itemType === "artistry") ||
    (mode === "edit" && selectedItem?.type === "artistry");

  const bodyInventoryItems: InventoryItem[] = useMemo(
    () =>
      bodyElements.map((element: { id: string; name: string; category: string; value: number }) => ({
        id: element.id,
        name: element.name,
        subtitle: `${element.category} · ${formatCopValue(element.value)}`,
      })),
    [bodyElements],
  );

  const artistryInventoryItems: InventoryItem[] = useMemo(
    () =>
      artistryComponents.map((component: { id: string; name: string }) => ({
        id: component.id,
        name: component.name,
      })),
    [artistryComponents],
  );

  const buildPayload = (): EditingPanelSubmitPayload | null => {
    switch (activeType) {
      case "risk": {
        const criteriaIds = [
          ...throwCriteriaIds,
          ...catchCriteriaIds,
          ...generalCriteriaIds,
        ];
        if (riskRotationIds.length < 2) {
          setFormError("Add at least 2 rotations for a valid risk.");
          return null;
        }
        if (riskRotationIds.some((id) => !id)) {
          setFormError("Choose a rotation for each entry.");
          return null;
        }
        const rotationCounts = new Map<string, number>();
        for (const rotationId of riskRotationIds) {
          rotationCounts.set(rotationId, (rotationCounts.get(rotationId) ?? 0) + 1);
        }
        const rotations = [...rotationCounts.entries()].map(([rotationId, count]) => ({
          rotationId,
          count,
        }));
        const riskError = validateRiskComposition({ criteriaIds, rotations });
        if (riskError) {
          setFormError(riskError);
          return null;
        }
        return {
          risk: {
            criteriaIds,
            rotations,
          },
        };
      }
      case "mastery": {
        if (masteryBaseIds.length === 0) {
          setFormError("Select at least one base.");
          return null;
        }
        const baseComboError = validateMasteryBaseCombination(masteryBaseIds);
        if (baseComboError) {
          setFormError(baseComboError);
          return null;
        }
        if (masteryCriteriaIds.length === 0) {
          setFormError("Select at least one DA criterion.");
          return null;
        }
        const baseCount = masteryBaseIds.length;
        const criteriaCount = masteryCriteriaIds.length;
        if (baseCount + criteriaCount !== 3) {
          setFormError("Use 1 base with 2 criteria, or 2 bases with 1 criterion.");
          return null;
        }
        if (baseCount === 1 && criteriaCount !== 2) {
          setFormError("One base requires exactly 2 criteria.");
          return null;
        }
        if (baseCount === 2 && criteriaCount !== 1) {
          setFormError("Two bases require exactly 1 criterion.");
          return null;
        }
        if (showMasteryRotation && !masteryRotationId) {
          setFormError("Select a rotation type for the rotation criterion.");
          return null;
        }
        return {
          mastery: {
            baseIds: masteryBaseIds,
            criteriaIds: masteryCriteriaIds,
            rotationId: showMasteryRotation ? masteryRotationId : undefined,
          },
        };
      }
      default:
        return null;
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    const payload = buildPayload();
    if (!payload) {
      return;
    }
    await onSubmit(payload);
  };

  const handleThrowCriteriaChange = (options: RCriteriaOption[]) => {
    let ids = options.map((option) => option.id);
    if (
      ids.includes(THROW_AFTER_ROLL_ON_FLOOR_ID) &&
      !ids.includes(WITHOUT_HANDS_THROW_ID)
    ) {
      ids = [...ids, WITHOUT_HANDS_THROW_ID];
    }
    setThrowCriteriaIds(ids);
  };

  const handleCatchCriteriaChange = (options: RCriteriaOption[]) => {
    let ids = options.map((option) => option.id);
    const directSelected = ids.filter((id) => isDirectCatchCriterion(id));
    if (directSelected.length > 1) {
      const latest = directSelected[directSelected.length - 1];
      ids = [...ids.filter((id) => !isDirectCatchCriterion(id)), latest];
    }
    const lastId = options.at(-1)?.id;
    if (ids.includes(WITHOUT_HANDS_CATCH_ID) && ids.some(isWithoutHandsIncompatibleCatch)) {
      if (lastId === WITHOUT_HANDS_CATCH_ID) {
        ids = ids.filter((id) => !isWithoutHandsIncompatibleCatch(id));
      } else {
        ids = ids.filter((id) => id !== WITHOUT_HANDS_CATCH_ID);
      }
    }
    setCatchCriteriaIds(ids);
  };

  const selectedDirectCatchId = catchCriteriaIds.find((id) => isDirectCatchCriterion(id));

  const masteryCriteriaLimit = masteryBaseIds.length === 2 ? 1 : 2;
  const masteryCriteriaHint =
    masteryBaseIds.length === 0
      ? null
      : masteryBaseIds.length === 2
        ? "Select exactly 1 criterion for a two-base mastery."
        : "Select exactly 2 criteria for a single-base mastery.";

  const handleMasteryBasesChange = (options: BaseOption[]) => {
    if (options.length > 2) {
      return;
    }
    const ids = options.map((base) => base.id);
    const comboError = validateMasteryBaseCombination(ids);
    if (comboError) {
      setFormError(comboError);
      return;
    }
    if (
      options.length === 2 &&
      !ids.includes(CATCH_FROM_HIGH_THROW_BASE_ID)
    ) {
      setFormError("Two bases are only allowed with Catch from a High Throw.");
      return;
    }
    if (options.length === 2 && ids.some(isAlternateCatchBase)) {
      setFormError(
        "Alternate catch bases (one-hand ball, club in same hand, or 2 clubs) cannot combine with Catch from a High Throw.",
      );
      return;
    }
    setFormError(null);
    setMasteryBaseIds(ids);
    const maxCriteria = options.length === 2 ? 1 : 2;
    setMasteryCriteriaIds((prev) =>
      prev
        .filter((id) => options.some((base) => base.allowedCriteria.includes(id)))
        .slice(0, maxCriteria),
    );
    if (!options.some((base) => base.allowedCriteria.includes(ROTATION_CRITERION_ID))) {
      setMasteryRotationId("");
    }
  };

  const handleBodyElementPick = async (id: string) => {
    if (mode === "edit" && selectedItem?.bodyElementId !== id) {
      await onSubmit({ bodyElementId: id });
      return;
    }
    if (mode === "add") {
      await onAddBodyElement(id);
    }
  };

  const handleArtistryPick = async (id: string) => {
    if (mode === "edit" && selectedItem?.artistryComponentId !== id) {
      await onSubmit({ artistryComponentId: id });
      return;
    }
    if (mode === "add") {
      await onAddArtistry(id);
    }
  };

  const addButtons: { type: RoutineItemType; label: string }[] = [
    { type: "body_element", label: "Body Element" },
    { type: "risk", label: "Risk" },
    { type: "mastery", label: "Mastery" },
    { type: "artistry", label: "Artistry" },
  ];

  const showForm =
    !showBodyInventory &&
    !showArtistryInventory &&
    mode !== "idle" &&
    (activeType === "risk" || activeType === "mastery");

  return (
    <Paper
      sx={{
        p: 1.5,
        height: "100%",
        minHeight: 640,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {mode === "idle" ? (
        <Typography variant="h6" gutterBottom>
          Inventory
        </Typography>
      ) : null}

      {formError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>
          {formError}
        </Alert>
      )}

      {showBodyInventory ? (
        <DraggableItemInventory
          title={mode === "edit" ? "Change body element" : "Body elements"}
          hint="Search, click Add, or drag to timeline."
          searchPlaceholder="Search elements…"
          items={bodyInventoryItems}
          selectedItemId={mode === "edit" ? selectedItem?.bodyElementId : null}
          dragIdPrefix="inventory-body"
          dragDataType="body-element"
          dragDataIdKey="bodyElementId"
          onAddItem={handleBodyElementPick}
          onBack={onBack}
          busy={busy}
          dragColor={TIMELINE_TYPE_COLORS.body_element}
          hiddenDragId={hiddenInventoryDragId}
        />
      ) : showArtistryInventory ? (
        <DraggableItemInventory
          title={mode === "edit" ? "Change artistry component" : "Artistry components"}
          hint="Search, click Add, or drag to timeline. Stay here to add more components."
          searchPlaceholder="Search components…"
          items={artistryInventoryItems}
          selectedItemId={mode === "edit" ? selectedItem?.artistryComponentId : null}
          dragIdPrefix="inventory-artistry"
          dragDataType="artistry"
          dragDataIdKey="artistryComponentId"
          onAddItem={handleArtistryPick}
          onBack={onBack}
          busy={busy}
          dragColor={TIMELINE_TYPE_COLORS.artistry}
          hiddenDragId={hiddenInventoryDragId}
        />
      ) : mode === "idle" ? (
        <>
          <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
            Add items to the timeline or select an existing item to edit.
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {addButtons.map(({ type, label }) => (
              <Button
                key={type}
                variant="outlined"
                disabled={busy}
                onClick={() => onStartAdd(type)}
              >
                + {label}
              </Button>
            ))}
          </Box>
        </>
      ) : showForm ? (
        <Box component="form" onSubmit={handleSubmit} sx={{ overflow: "auto", flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
            <IconButton aria-label="Back to inventory menu" size="small" onClick={onBack} disabled={busy}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {mode === "add"
                ? `Add ${activeType ? getRoutineItemTypeLabel(activeType) : "item"}`
                : `Edit ${activeType ? getRoutineItemTypeLabel(activeType) : "item"}`}
            </Typography>
          </Box>

          {activeType === "risk" && (
            <>
              <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mt: 1 }}>
                Throw criteria
              </Typography>
              <Autocomplete
                multiple
                size="small"
                options={throwCriteria}
                getOptionLabel={(option: RCriteriaOption) => option.name}
                value={throwCriteria.filter((c: RCriteriaOption) =>
                  throwCriteriaIds.includes(c.id),
                )}
                onChange={(_event, options) => handleThrowCriteriaChange(options)}
                slotProps={compactListboxSlotProps}
                renderOption={(props, option: RCriteriaOption) =>
                  renderCompactOption(props, option.name)
                }
                renderInput={(params) =>
                  renderCompactAutocompleteInput(params, {
                    placeholder: "Select throw criteria",
                  })
                }
                disabled={busy}
              />

              <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mt: 1 }}>
                Catch criteria
              </Typography>
              <Autocomplete
                multiple
                size="small"
                options={catchCriteria}
                getOptionLabel={(option: RCriteriaOption) => option.name}
                value={catchCriteria.filter((c: RCriteriaOption) =>
                  catchCriteriaIds.includes(c.id),
                )}
                onChange={(_event, options) => handleCatchCriteriaChange(options)}
                getOptionDisabled={(option) => {
                  if (
                    isDirectCatchCriterion(option.id) &&
                    selectedDirectCatchId != null &&
                    selectedDirectCatchId !== option.id
                  ) {
                    return true;
                  }
                  if (
                    option.id === "catch-ball-one-hand" &&
                    catchCriteriaIds.includes(WITHOUT_HANDS_CATCH_ID)
                  ) {
                    return true;
                  }
                  if (
                    option.id === WITHOUT_HANDS_CATCH_ID &&
                    catchCriteriaIds.includes("catch-ball-one-hand")
                  ) {
                    return true;
                  }
                  if (
                    option.id === WITHOUT_HANDS_CATCH_ID &&
                    catchCriteriaIds.some(isWithoutHandsIncompatibleCatch)
                  ) {
                    return true;
                  }
                  if (
                    isWithoutHandsIncompatibleCatch(option.id) &&
                    catchCriteriaIds.includes(WITHOUT_HANDS_CATCH_ID)
                  ) {
                    return true;
                  }
                  return false;
                }}
                slotProps={compactListboxSlotProps}
                renderOption={(props, option: RCriteriaOption) =>
                  renderCompactOption(props, option.name)
                }
                renderInput={(params) =>
                  renderCompactAutocompleteInput(params, {
                    placeholder: "Select catch criteria",
                  })
                }
                disabled={busy}
              />

              <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mt: 1 }}>
                General criteria
              </Typography>
              <Autocomplete
                multiple
                size="small"
                options={generalCriteria}
                getOptionLabel={(option: RCriteriaOption) => option.name}
                value={generalCriteria.filter((c: RCriteriaOption) =>
                  generalCriteriaIds.includes(c.id),
                )}
                onChange={(_event, options) => setGeneralCriteriaIds(options.map((o) => o.id))}
                slotProps={compactListboxSlotProps}
                renderOption={(props, option: RCriteriaOption) =>
                  renderCompactOption(props, option.name)
                }
                renderInput={(params) =>
                  renderCompactAutocompleteInput(params, {
                    placeholder: "Select general criteria",
                  })
                }
                disabled={busy}
              />

              <Divider sx={{ my: 1.5 }} />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                  mb: 0.5,
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Rotations
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  disabled={busy}
                  onClick={() => setRiskRotationIds((prev) => [...prev, ""])}
                  sx={{ fontSize: "0.75rem", minWidth: 0, px: 0.5 }}
                >
                  + Add
                </Button>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                Minimum 2 rotations under the flight. Search by name or group.
              </Typography>
              {riskRotationIds.map((rotationId, index) => (
                <Box key={index} sx={{ display: "flex", gap: 0.5, mb: 0.75, alignItems: "center" }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <RotationPicker
                      placeholder={`Rotation ${index + 1}`}
                      value={rotationId}
                      rotations={rotations}
                      onChange={(nextId) => {
                        const next = [...riskRotationIds];
                        next[index] = nextId;
                        setRiskRotationIds(next);
                      }}
                      disabled={busy}
                    />
                  </Box>
                  <IconButton
                    size="small"
                    aria-label="Remove rotation"
                    color="error"
                    disabled={busy || riskRotationIds.length <= MIN_BASE_ROTATIONS}
                    sx={{ mt: 0.25 }}
                    onClick={() =>
                      setRiskRotationIds((prev) => prev.filter((_, i) => i !== index))
                    }
                  >
                    <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              ))}
            </>
          )}

          {activeType === "mastery" && (
            <>
              {masteryBaseHint && (
                <Alert severity="info" sx={{ mb: 1 }}>
                  {masteryBaseHint}
                </Alert>
              )}
              <Autocomplete
                multiple
                size="small"
                open={masteryBasesOpen}
                onOpen={() => setMasteryBasesOpen(true)}
                onClose={() => setMasteryBasesOpen(false)}
                options={selectableMasteryBases}
                getOptionLabel={(option: BaseOption) =>
                  `${option.name} (${formatCopValue(option.value)})`
                }
                value={bases.filter((b: BaseOption) => masteryBaseIds.includes(b.id))}
                onChange={(_event, options) => {
                  handleMasteryBasesChange(options);
                  setMasteryBasesOpen(false);
                }}
                getOptionDisabled={(option) => {
                  if (masteryBaseIds.length >= 2 && !masteryBaseIds.includes(option.id)) {
                    return true;
                  }
                  if (
                    isAlternateCatchBase(option.id) &&
                    masteryBaseIds.includes(CATCH_FROM_HIGH_THROW_BASE_ID)
                  ) {
                    return true;
                  }
                  if (
                    option.id === CATCH_FROM_HIGH_THROW_BASE_ID &&
                    masteryBaseIds.some(isAlternateCatchBase)
                  ) {
                    return true;
                  }
                  return false;
                }}
                slotProps={compactListboxSlotProps}
                renderOption={(props, option: BaseOption) =>
                  renderCompactOption(
                    props,
                    `${option.name} (${formatCopValue(option.value)})`,
                  )
                }
                renderInput={(params) =>
                  renderCompactAutocompleteInput(params, { label: "Bases" })
                }
                disabled={busy}
              />
              {masteryCriteriaHint && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                  {masteryCriteriaHint}
                </Typography>
              )}
              <Autocomplete
                multiple
                size="small"
                options={allowedMasteryCriteria}
                getOptionLabel={(option: CriteriaOption) => option.name}
                value={allowedMasteryCriteria.filter((c: CriteriaOption) =>
                  masteryCriteriaIds.includes(c.id),
                )}
                onChange={(_event, options) => {
                  if (options.length > masteryCriteriaLimit) {
                    return;
                  }
                  const ids = options.map((o) => o.id);
                  setMasteryCriteriaIds(ids);
                  if (!ids.includes(ROTATION_CRITERION_ID)) {
                    setMasteryRotationId("");
                  }
                }}
                slotProps={compactListboxSlotProps}
                renderOption={(props, option: CriteriaOption) =>
                  renderCompactOption(props, option.name)
                }
                renderInput={(params) =>
                  renderCompactAutocompleteInput(params, { label: "DA criteria" })
                }
                disabled={busy || masteryBaseIds.length === 0}
              />
              {showMasteryRotation && (
                <Box sx={{ mt: 2 }}>
                  <RotationPicker
                    label="Rotation type"
                    value={masteryRotationId}
                    rotations={rotations}
                    onChange={setMasteryRotationId}
                    disabled={busy}
                  />
                </Box>
              )}
            </>
          )}

          <Button type="submit" variant="contained" disabled={busy} sx={{ mt: 2 }}>
            {mode === "add" ? "Add to timeline" : "Save changes"}
          </Button>
        </Box>
      ) : null}
    </Paper>
  );
}
