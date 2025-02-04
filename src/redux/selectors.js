import { createSelector } from "reselect";
import { startOfToday } from "date-fns";

// Define a constant empty array to avoid creating new arrays on each call.
const EMPTY_ARRAY = [];

// Input selector: gets the entire feedings array
const feedingsSelector = (state) => state.feedings;

// Memoized selector: filters feedings for a specific pet
export const selectFeedingsByPet = createSelector(
  [feedingsSelector, (_, petId) => Number(petId)],
  (feedings, petId) => {
    const result = feedings.filter(
      (feeding) => Number(feeding.petId) === petId
    );
    console.log("selectFeedingsByPet:", { petId, result });
    return result;
  }
);

// Selector to filter upcoming and incomplete feedings, then sort them by feedingDate (soonest first)
// Now we use a fixed reference date (startOfToday) so that the computed result is stable.
export const selectUpcomingFeedings = createSelector(
  [feedingsSelector],
  (feedings) => {
    const today = startOfToday();
    const filtered = feedings.filter(
      (feeding) =>
        new Date(feeding.feedingDate) > today && feeding.complete === 0
    );
    // Clone before sorting so that we don’t mutate the filtered array.
    const sorted = [...filtered].sort(
      (a, b) => new Date(a.feedingDate) - new Date(b.feedingDate)
    );

    // Simple caching: if lastResult exists and is shallowly equal by id, return it.
    if (
      selectUpcomingFeedings.lastResult &&
      selectUpcomingFeedings.lastResult.length === sorted.length &&
      selectUpcomingFeedings.lastResult.every(
        (item, index) => item.id === sorted[index].id
      )
    ) {
      return selectUpcomingFeedings.lastResult;
    }
    // Cache the new result
    selectUpcomingFeedings.lastResult = sorted;
    console.log("selectUpcomingFeedings:", sorted);
    return sorted;
  }
);

// Selector to get the groupPets slice from state.
// Use EMPTY_ARRAY so that if state.groupPets[groupId] is undefined,
// you always return the same empty array reference.
const selectGroupPetsByGroupId = (state, groupId) =>
  state.groupPets[groupId] || EMPTY_ARRAY;

// Create a memoized selector for groupPets using a factory function.
// Note: Instead of returning the input reference directly, we return a shallow copy.
export const makeSelectGroupPets = () =>
  createSelector([selectGroupPetsByGroupId], (pets) => {
    console.log("makeSelectGroupPets: pets reference", pets);
    return pets.slice(); // Return a shallow copy to avoid returning the same reference.
  });

// Selector to get the groups array from state
const selectAllGroups = (state) => state.groups.groups;

// Selector to get the groupId (passed as a prop)
const selectGroupId = (_, groupId) => groupId;

// Create a memoized selector to find a group by ID
export const selectGroupById = createSelector(
  [selectAllGroups, selectGroupId],
  (groups, groupId) => {
    const result = groups.find((g) => g.id === groupId);
    console.log("selectGroupById:", { groupId, result });
    return result;
  }
);

// Basic input selector for schedules from state
const feedingSchedulesSelector = (state) => state.feedingSchedules.schedules;

// Selector to get schedules for a specific pet
export const selectFeedingSchedulesByPet = createSelector(
  [feedingSchedulesSelector, (_, petId) => Number(petId)],
  (schedules, petId) =>
    schedules.filter((sched) => Number(sched.petId) === petId)
);
