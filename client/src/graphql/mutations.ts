import { gql } from "@apollo/client";

export const SIGN_UP_MUTATION = gql`
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      token
      coach {
        id
        email
        firstName
        lastName
        club
        createdAt
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      coach {
        id
        email
        firstName
        lastName
        club
        createdAt
      }
    }
  }
`;

export const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email) {
      message
    }
  }
`;

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      message
    }
  }
`;

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      email
      firstName
      lastName
      club
      createdAt
    }
  }
`;

export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword) {
      message
    }
  }
`;

export const CREATE_ROUTINE_MUTATION = gql`
  mutation CreateRoutine($input: CreateRoutineInput!) {
    createRoutine(input: $input) {
      id
      gymnastName
      apparatus
      ageCategory
      dbScore
      daScore
      validation {
        isValid
      }
      createdAt
      updatedAt
    }
  }
`;

const ROUTINE_BUILDER_FIELDS = gql`
  fragment RoutineBuilderFields on Routine {
    id
    gymnastName
    apparatus
    ageCategory
    dbScore
    daScore
    validation {
      isValid
      dbValid
      daValid
      artistryValid
      missingRequirements {
        id
        domain
        message
      }
      calculatedAt
    }
    timeline {
      id
      type
      order
      bodyElementId
      bodyElement {
        id
        name
        category
        value
      }
      risk {
        criteriaIds
        rotations {
          rotationId
          count
        }
        bodyElementId
        value
      }
      mastery {
        baseIds
        criteriaIds
        rotationId
        value
        isAcro
      }
      artistryComponentId
      artistryComponent {
        id
        name
        type
      }
    }
    updatedAt
  }
`;

export const ADD_ROUTINE_ITEM_MUTATION = gql`
  ${ROUTINE_BUILDER_FIELDS}
  mutation AddRoutineItem($routineId: ID!, $input: AddRoutineItemInput!) {
    addRoutineItem(routineId: $routineId, input: $input) {
      ...RoutineBuilderFields
    }
  }
`;

export const REMOVE_ROUTINE_ITEM_MUTATION = gql`
  ${ROUTINE_BUILDER_FIELDS}
  mutation RemoveRoutineItem($routineId: ID!, $itemId: ID!) {
    removeRoutineItem(routineId: $routineId, itemId: $itemId) {
      ...RoutineBuilderFields
    }
  }
`;

export const REORDER_ROUTINE_ITEMS_MUTATION = gql`
  ${ROUTINE_BUILDER_FIELDS}
  mutation ReorderRoutineItems($routineId: ID!, $itemIds: [ID!]!) {
    reorderRoutineItems(routineId: $routineId, itemIds: $itemIds) {
      ...RoutineBuilderFields
    }
  }
`;

export const UPDATE_ROUTINE_ITEM_MUTATION = gql`
  ${ROUTINE_BUILDER_FIELDS}
  mutation UpdateRoutineItem(
    $routineId: ID!
    $itemId: ID!
    $input: UpdateRoutineItemInput!
  ) {
    updateRoutineItem(routineId: $routineId, itemId: $itemId, input: $input) {
      ...RoutineBuilderFields
    }
  }
`;

export const DELETE_ROUTINE_MUTATION = gql`
  mutation DeleteRoutine($id: ID!) {
    deleteRoutine(id: $id) {
      message
    }
  }
`;
