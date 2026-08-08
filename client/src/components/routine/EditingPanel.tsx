import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
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
import { getRoutineItemTypeLabel } from "../../types/routine";

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

interface BodyElementOption {
  id: string;
  name: string;
  category: string;
  value: number;
}

interface RotationOption {
  id: string;
  name: string;
  group: string;
}

interface ArtistryOption {
  id: string;
  name: string;
  type: string;
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
    bodyElementId?: string;
  };
  mastery?: {
    baseIds: string[];
    criteriaIds: string[];
    rotationId?: string;
  };
}

interface EditingPanelProps {
  apparatus: Apparatus;
  mode: "empty" | "add" | "edit";
  itemType: RoutineItemType | null;
  selectedItem: RoutineItem | null;
  onSubmit: (payload: EditingPanelSubmitPayload) => Promise<void>;
  busy: boolean;
}

export function EditingPanel({
  apparatus,
  mode,
  itemType,
  selectedItem,
  onSubmit,
  busy,
}: EditingPanelProps) {
  const { data: bodyElementsData } = useQuery<{ bodyElements: BodyElementOption[] }>(
    BODY_ELEMENTS_QUERY,
  );
  const { data: basesData } = useQuery<{ bases: BaseOption[] }>(BASES_QUERY, {
    variables: { apparatus },
  });
  const { data: daCriteriaData } = useQuery<{ daCriteria: CriteriaOption[] }>(
    DA_CRITERIA_QUERY,
  );
  const { data: rCriteriaData } = useQuery<{ rCriteria: RCriteriaOption[] }>(
    R_CRITERIA_QUERY,
    { variables: { apparatus } },
  );
  const { data: rotationsData } = useQuery<{ rotations: RotationOption[] }>(
    ROTATIONS_QUERY,
  );
  const { data: artistryData } = useQuery<{ artistryComponents: ArtistryOption[] }>(
    ARTISTRY_COMPONENTS_QUERY,
  );

  const bodyElements = bodyElementsData?.bodyElements ?? [];
  const bases = basesData?.bases ?? [];
  const daCriteria = daCriteriaData?.daCriteria ?? [];
  const rCriteria = rCriteriaData?.rCriteria ?? [];
  const rotations = rotationsData?.rotations ?? [];
  const artistryComponents = artistryData?.artistryComponents ?? [];

  const activeType = mode === "edit" ? selectedItem?.type : itemType;

  const [bodyElementId, setBodyElementId] = useState("");
  const [artistryComponentId, setArtistryComponentId] = useState("");
  const [riskCriteriaIds, setRiskCriteriaIds] = useState<string[]>([]);
  const [riskRotationId, setRiskRotationId] = useState("");
  const [riskRotationCount, setRiskRotationCount] = useState(2);
  const [riskBodyElementId, setRiskBodyElementId] = useState("");
  const [masteryBaseIds, setMasteryBaseIds] = useState<string[]>([]);
  const [masteryCriteriaIds, setMasteryCriteriaIds] = useState<string[]>([]);
  const [masteryRotationId, setMasteryRotationId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setFormError(null);
    if (mode === "edit" && selectedItem) {
      setBodyElementId(selectedItem.bodyElementId ?? "");
      setArtistryComponentId(selectedItem.artistryComponentId ?? "");
      setRiskCriteriaIds(selectedItem.risk?.criteriaIds ?? []);
      setRiskRotationId(selectedItem.risk?.rotations[0]?.rotationId ?? "");
      setRiskRotationCount(selectedItem.risk?.rotations[0]?.count ?? 2);
      setRiskBodyElementId(selectedItem.risk?.bodyElementId ?? "");
      setMasteryBaseIds(selectedItem.mastery?.baseIds ?? []);
      setMasteryCriteriaIds(selectedItem.mastery?.criteriaIds ?? []);
      setMasteryRotationId(selectedItem.mastery?.rotationId ?? "");
    } else if (mode === "add") {
      setBodyElementId("");
      setArtistryComponentId("");
      setRiskCriteriaIds([]);
      setRiskRotationId(rotations[0]?.id ?? "");
      setRiskRotationCount(2);
      setRiskBodyElementId("");
      setMasteryBaseIds([]);
      setMasteryCriteriaIds([]);
      setMasteryRotationId("");
    }
  }, [mode, selectedItem, rotations]);

  const allowedMasteryCriteria = useMemo(() => {
    if (masteryBaseIds.length === 0) {
      return daCriteria;
    }
    const allowed = new Set<string>();
    for (const baseId of masteryBaseIds) {
      const base = bases.find((b) => b.id === baseId);
      base?.allowedCriteria.forEach((id) => allowed.add(id));
    }
    return daCriteria.filter((c) => allowed.has(c.id));
  }, [masteryBaseIds, bases, daCriteria]);

  const buildPayload = (): EditingPanelSubmitPayload | null => {
    switch (activeType) {
      case "body_element":
        if (!bodyElementId) {
          setFormError("Select a body element.");
          return null;
        }
        return { bodyElementId };
      case "artistry":
        if (!artistryComponentId) {
          setFormError("Select an artistry component.");
          return null;
        }
        return { artistryComponentId };
      case "risk": {
        if (riskCriteriaIds.length === 0) {
          setFormError("Select at least one risk criterion.");
          return null;
        }
        if (!riskRotationId) {
          setFormError("Select a rotation.");
          return null;
        }
        if (riskRotationCount < 1) {
          setFormError("Rotation count must be at least 1.");
          return null;
        }
        return {
          risk: {
            criteriaIds: riskCriteriaIds,
            rotations: [{ rotationId: riskRotationId, count: riskRotationCount }],
            bodyElementId: riskBodyElementId || undefined,
          },
        };
      }
      case "mastery": {
        if (masteryBaseIds.length === 0) {
          setFormError("Select at least one base.");
          return null;
        }
        if (masteryCriteriaIds.length === 0) {
          setFormError("Select at least one DA criterion.");
          return null;
        }
        return {
          mastery: {
            baseIds: masteryBaseIds,
            criteriaIds: masteryCriteriaIds,
            rotationId: masteryRotationId || undefined,
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

  const handleBodyElementChange = async (value: string) => {
    setBodyElementId(value);
    if (mode === "add" && value) {
      setFormError(null);
      await onSubmit({ bodyElementId: value });
    }
  };

  const handleArtistryChange = async (value: string) => {
    setArtistryComponentId(value);
    if (mode === "add" && value) {
      setFormError(null);
      await onSubmit({ artistryComponentId: value });
    }
  };

  if (mode === "empty") {
    return (
      <Paper sx={{ p: 3, height: "100%" }}>
        <Typography variant="h6" gutterBottom>
          Editing
        </Typography>
        <Typography color="text.secondary">
          Select an item from the timeline or add a new one.
        </Typography>
      </Paper>
    );
  }

  const title =
    mode === "add"
      ? `Add ${activeType ? getRoutineItemTypeLabel(activeType) : "Item"}`
      : `Edit ${activeType ? getRoutineItemTypeLabel(activeType) : "Item"}`;

  return (
    <Paper sx={{ p: 2, height: "100%" }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>

      {formError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {formError}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        {activeType === "body_element" && (
          <Autocomplete
            options={bodyElements}
            getOptionLabel={(option) => `${option.name} (${option.category}, ${option.value})`}
            value={bodyElements.find((e) => e.id === bodyElementId) ?? null}
            onChange={(_event, option) => {
              void handleBodyElementChange(option?.id ?? "");
            }}
            renderInput={(params) => (
              <TextField {...params} label="Body element" required margin="normal" fullWidth />
            )}
            disabled={busy}
          />
        )}

        {activeType === "artistry" && (
          <Autocomplete
            options={artistryComponents}
            groupBy={(option) => option.type}
            getOptionLabel={(option) => option.name}
            value={artistryComponents.find((c) => c.id === artistryComponentId) ?? null}
            onChange={(_event, option) => {
              void handleArtistryChange(option?.id ?? "");
            }}
            renderInput={(params) => (
              <TextField {...params} label="Artistry component" required margin="normal" fullWidth />
            )}
            disabled={busy}
          />
        )}

        {activeType === "risk" && (
          <>
            <Autocomplete
              multiple
              options={rCriteria}
              getOptionLabel={(option) => `${option.name} (${option.value})`}
              value={rCriteria.filter((c) => riskCriteriaIds.includes(c.id))}
              onChange={(_event, options) => setRiskCriteriaIds(options.map((o) => o.id))}
              renderInput={(params) => (
                <TextField {...params} label="Risk criteria" required margin="normal" fullWidth />
              )}
              disabled={busy}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="risk-rotation-label">Rotation</InputLabel>
              <Select
                labelId="risk-rotation-label"
                label="Rotation"
                value={riskRotationId}
                onChange={(event) => setRiskRotationId(event.target.value)}
                disabled={busy}
              >
                {rotations.map((rotation) => (
                  <MenuItem key={rotation.id} value={rotation.id}>
                    {rotation.name} ({rotation.group})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="normal"
              fullWidth
              type="number"
              label="Rotation count"
              slotProps={{ htmlInput: { min: 1 } }}
              value={riskRotationCount}
              onChange={(event) => setRiskRotationCount(Number(event.target.value))}
              disabled={busy}
            />
            <Autocomplete
              options={bodyElements.filter((e) => e.value >= 0.2)}
              getOptionLabel={(option) => `${option.name} (${option.value})`}
              value={bodyElements.find((e) => e.id === riskBodyElementId) ?? null}
              onChange={(_event, option) => setRiskBodyElementId(option?.id ?? "")}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Optional body element (≥ 0.20)"
                  margin="normal"
                  fullWidth
                />
              )}
              disabled={busy}
            />
          </>
        )}

        {activeType === "mastery" && (
          <>
            <Autocomplete
              multiple
              options={bases}
              getOptionLabel={(option) => `${option.name} (${option.value})`}
              value={bases.filter((b) => masteryBaseIds.includes(b.id))}
              onChange={(_event, options) => {
                setMasteryBaseIds(options.map((o) => o.id));
                setMasteryCriteriaIds((prev) =>
                  prev.filter((id) =>
                    options.some((base) => base.allowedCriteria.includes(id)),
                  ),
                );
              }}
              renderInput={(params) => (
                <TextField {...params} label="Bases" required margin="normal" fullWidth />
              )}
              disabled={busy}
            />
            <Autocomplete
              multiple
              options={allowedMasteryCriteria}
              getOptionLabel={(option) => option.name}
              value={allowedMasteryCriteria.filter((c) => masteryCriteriaIds.includes(c.id))}
              onChange={(_event, options) => setMasteryCriteriaIds(options.map((o) => o.id))}
              renderInput={(params) => (
                <TextField {...params} label="DA criteria" required margin="normal" fullWidth />
              )}
              disabled={busy || masteryBaseIds.length === 0}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="mastery-rotation-label">Rotation (optional)</InputLabel>
              <Select
                labelId="mastery-rotation-label"
                label="Rotation (optional)"
                value={masteryRotationId}
                onChange={(event) => setMasteryRotationId(event.target.value)}
                disabled={busy}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {rotations.map((rotation) => (
                  <MenuItem key={rotation.id} value={rotation.id}>
                    {rotation.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {masteryBaseIds.map((id) => (
                <Chip key={id} size="small" label={`Base: ${id}`} />
              ))}
            </Box>
          </>
        )}

        {(activeType === "risk" || activeType === "mastery" || mode === "edit") &&
          activeType !== "body_element" &&
          activeType !== "artistry" && (
            <Button type="submit" variant="contained" disabled={busy} sx={{ mt: 2 }}>
              {mode === "add" ? "Add to timeline" : "Save changes"}
            </Button>
          )}

        {mode === "edit" && (activeType === "body_element" || activeType === "artistry") && (
          <Button type="submit" variant="contained" disabled={busy} sx={{ mt: 2 }}>
            Save changes
          </Button>
        )}
      </Box>
    </Paper>
  );
}
