import axios from 'axios';
import { parseStudyLoad } from '../lib/parsers/parseStudyLoad';
import { createRequestHeaders } from '../lib/utils/createRequestHeaders';
import { env } from '../config/env';
import { RequestTokenCookies } from '../types/RequestTokenCookies';
import { log } from '../lib/utils/log';
import { StudyLoadCourse } from '../types/StudyLoadCourse';
import { StudyLoadArgsSchema } from '../types/StudyLoadCourse';

export async function getStudyLoad(
  cookies: RequestTokenCookies,
  args?: any
): Promise<StudyLoadCourse[]> {
  const parsedArgs = StudyLoadArgsSchema.safeParse(args ?? {});

  if (!parsedArgs.success) {
    throw new Error(parsedArgs.error.issues[0].message);
  }

  try {
    const formData = new URLSearchParams();
    formData.append('AcademicPeriod', parsedArgs.data.period);
    formData.append('AcademicYear', parsedArgs.data.year);
    formData.append('AjaxFormVM.Controller', 'AdvisedCourse');
    formData.append('AjaxFormVM.Action', 'StudentStudyLoad');
    formData.append('AjaxFormVM.ResultTargetId', 'StudyLoad');
    formData.append('AjaxFormVM.LinkToReturn', '');
    formData.append('AjaxFormVM.LinkToReturnTargetId', '');
    formData.append('AjaxFormVM.FormHeader', 'Select Term and Year');
    formData.append('AjaxFormVM.FormHeaderIcon', '');
    formData.append('AjaxFormVM.FormId', 'AdvisedCourseStudentStudyLoad');
    formData.append('AjaxFormVM.ShowCloseButton', 'True');
    formData.append('AjaxFormVM.PreventAutoUpdateTarget', 'True');
    formData.append('AjaxFormVM.CloseModalAfterSubmit', 'False');
    formData.append('AjaxFormVM.AjaxFormType', 'Search');
    formData.append('AjaxFormVM.FormNoteLocation', '');
    formData.append('AjaxFormVM.SubmitButton.FaIcon', '');
    formData.append('AjaxFormVM.SubmitButton.ButtonText', '');
    formData.append('AjaxFormVM.SubmitButton.ButtonSize', '');
    formData.append(
      '__RequestVerificationToken',
      cookies.__RequestVerificationToken
    );
    formData.append('X-Requested-With', 'XMLHttpRequest');

    const response = await axios.post(
      `https://${env.ISMIS_DOMAIN}/EnrolledCourse/StudentStudyLoad?Length=13`,
      formData,
      {
        headers: {
          ...createRequestHeaders(cookies),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return parseStudyLoad(response.data);
  } catch (error) {
    throw error;
  }
}
