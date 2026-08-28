import {
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

/** Pointer drag starts after 6px movement (desktop). */
const POINTER_ACTIVATION = { distance: 6 } as const;

/** Touch drag starts after 250ms press — allows scroll without accidental drags. */
const TOUCH_ACTIVATION = { delay: 250, tolerance: 8 } as const;

export function useRoutineBuilderSensors() {
  return useSensors(
    useSensor(PointerSensor, { activationConstraint: POINTER_ACTIVATION }),
    useSensor(TouchSensor, { activationConstraint: TOUCH_ACTIVATION }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
}
