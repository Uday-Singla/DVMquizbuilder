from .models import Member, Question, Answer

from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import HttpResponse, JsonResponse
import re


def instructions(request):
    return render(request, 'base/instructions.html')


def index(request):
    return render(request, 'base/main.html')

# def check_answer(request):
#     if request.method = 'POST':
#         try:
#             question

def get_question(request, question_key):
    current_question = Question.objects.get(questionkey=question_key)

    if current_question.is_mcq == True:
        answerlist = []
        for answer in current_question.answers.all():
            answerlist.append(answer.content)
        data = {
            "question":current_question.content,
            "answers":answerlist,
            "mcq_flag":True
        }
        return JsonResponse(data)
    else:
        data = {
            "question":current_question.content,
            "mcq_flag":False
        }
        return JsonResponse(data)
        

