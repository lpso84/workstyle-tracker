// src/ai/flows/attendance-advisor.ts
'use server';

/**
 * @fileOverview A flow for generating attendance recommendations based on user data.
 *
 * - attendanceAdvisorRecommendations - A function that returns attendance recommendations.
 * - AttendanceAdvisorRecommendationsInput - The input type for the attendanceAdvisorRecommendations function.
 * - AttendanceAdvisorRecommendationsOutput - The return type for the attendanceAdvisorRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AttendanceAdvisorRecommendationsInputSchema = z.object({
  workFromHomeDays: z
    .number()
    .describe('The number of days the user has worked from home this month.'),
  workFromOfficeDays: z
    .number()
    .describe('The number of days the user has worked from the office this month.'),
  vacationDays: z
    .number()
    .describe('The number of vacation days the user has taken this month.'),
  holidaysInMonth: z
    .number()
    .describe('The number of holidays in the current month.'),
  totalWorkdaysInMonth: z
    .number()
    .describe('The total number of workdays in the current month.'),
  officeDaysGoalPercentage: z
    .number()
    .describe('The goal percentage of days the user wants to work from the office this month.'),
});
export type AttendanceAdvisorRecommendationsInput = z.infer<typeof AttendanceAdvisorRecommendationsInputSchema>;

const AttendanceAdvisorRecommendationsOutputSchema = z.object({
  officeDaysNeeded: z
    .number()
    .describe('The number of additional days the user needs to work from the office to meet their goal.'),
  recommendationReasoning: z
    .string()
    .describe('The reasoning behind the number of office days needed.'),
});
export type AttendanceAdvisorRecommendationsOutput = z.infer<typeof AttendanceAdvisorRecommendationsOutputSchema>;

export async function attendanceAdvisorRecommendations(
  input: AttendanceAdvisorRecommendationsInput
): Promise<AttendanceAdvisorRecommendationsOutput> {
  return attendanceAdvisorRecommendationsFlow(input);
}

const attendanceAdvisorRecommendationsPrompt = ai.definePrompt({
  name: 'attendanceAdvisorRecommendationsPrompt',
  input: {schema: AttendanceAdvisorRecommendationsInputSchema},
  output: {schema: AttendanceAdvisorRecommendationsOutputSchema},
  prompt: `You are an AI assistant that provides personalized recommendations on the number of days a user should work from the office in the current month to meet their employer's attendance policy.

  Based on the following information, calculate the number of additional days the user needs to work from the office to meet their goal and explain the reasoning behind the recommendation.

  Work from home days: {{workFromHomeDays}}
  Work from office days: {{workFromOfficeDays}}
  Vacation days: {{vacationDays}}
  Holidays in month: {{holidaysInMonth}}
  Total workdays in month: {{totalWorkdaysInMonth}}
  Office days goal percentage: {{officeDaysGoalPercentage}}

  Consider that the officeDaysGoalPercentage is the minimum percentage of days the user wants to work from the office.
  Provide the officeDaysNeeded and recommendationReasoning in the output.
`,
});

const attendanceAdvisorRecommendationsFlow = ai.defineFlow(
  {
    name: 'attendanceAdvisorRecommendationsFlow',
    inputSchema: AttendanceAdvisorRecommendationsInputSchema,
    outputSchema: AttendanceAdvisorRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await attendanceAdvisorRecommendationsPrompt(input);
    return output!;
  }
);
