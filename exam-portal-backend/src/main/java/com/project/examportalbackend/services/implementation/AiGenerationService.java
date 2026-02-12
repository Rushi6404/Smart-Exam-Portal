package com.project.examportalbackend.services.implementation;

import com.project.examportalbackend.models.Question;
import com.project.examportalbackend.models.Quiz;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class AiGenerationService {

        public List<Question> generateQuestions(String topic, int totalQuestions, String difficulty, Quiz quiz) {
                List<Question> questions = new ArrayList<>();

                int easyCount = 0;
                int mediumCount = 0;
                int hardCount = 0;

                // Distribution Logic
                if (difficulty.equalsIgnoreCase("Easy")) {
                        easyCount = (int) Math.round(totalQuestions * 0.8);
                        mediumCount = totalQuestions - easyCount;
                } else if (difficulty.equalsIgnoreCase("Medium")) {
                        easyCount = (int) Math.round(totalQuestions * 0.3);
                        mediumCount = (int) Math.round(totalQuestions * 0.5);
                        hardCount = totalQuestions - easyCount - mediumCount;
                } else {
                        // Hard
                        mediumCount = (int) Math.round(totalQuestions * 0.3);
                        hardCount = totalQuestions - mediumCount;
                }

                // Ensure total matches due to rounding
                int currentTotal = easyCount + mediumCount + hardCount;
                if (currentTotal < totalQuestions) {
                        if (difficulty.equalsIgnoreCase("Easy"))
                                easyCount += (totalQuestions - currentTotal);
                        else if (difficulty.equalsIgnoreCase("Medium"))
                                mediumCount += (totalQuestions - currentTotal);
                        else
                                hardCount += (totalQuestions - currentTotal);
                }

                questions.addAll(mockGenerate(topic, "Easy", easyCount, quiz));
                questions.addAll(mockGenerate(topic, "Medium", mediumCount, quiz));
                questions.addAll(mockGenerate(topic, "Hard", hardCount, quiz));

                return questions;
        }

        private List<Question> mockGenerate(String topic, String level, int count, Quiz quiz) {
                if (count == 0)
                        return new ArrayList<>();

                List<Question> pool = getQuestionPool(topic, level);

                // Shuffle to get random unique questions from the pool
                Collections.shuffle(pool);

                List<Question> selected = new ArrayList<>();
                for (int i = 0; i < count; i++) {
                        Question q = new Question();
                        Question source;

                        if (i < pool.size()) {
                                // Take unique question from pool
                                source = pool.get(i);
                                q.setContent(source.getContent());
                        } else {
                                // If pool exhausted, recycle with variant
                                source = pool.get(i % pool.size());
                                q.setContent(source.getContent() + " (Variant " + ((i / pool.size()) + 1) + ")");
                        }

                        q.setOption1(source.getOption1());
                        q.setOption2(source.getOption2());
                        q.setOption3(source.getOption3());
                        q.setOption4(source.getOption4());
                        q.setAnswer(source.getAnswer());
                        q.setQuiz(quiz);
                        selected.add(q);
                }
                return selected;
        }

        private List<Question> getQuestionPool(String topic, String level) {
                List<Question> list = new ArrayList<>();
                topic = topic != null ? topic.toLowerCase() : "";
                boolean isEasy = level.equalsIgnoreCase("Easy");

                if (topic.contains("cpp") || topic.contains("c++") || topic.contains("plus")) {
                        if (isEasy) {
                                add(list, "What is the output of 'cout << \"Hello\";'?", "Hello", "World", "Error",
                                                "None", "option1");
                                add(list, "Which symbol is used for single line comment?", "//", "/*", "#", "--",
                                                "option1");
                                add(list, "Which header file is required for input/output?", "iostream", "stdio.h",
                                                "conio.h",
                                                "stdlib.h", "option1");
                                add(list, "How do you declare an integer variable?", "int x;", "float x;", "char x;",
                                                "string x;",
                                                "option1");
                                add(list, "Which operator is used to access members of a structure?", ".", "->", "*",
                                                "&", "option1");
                        } else {
                                add(list, "What is a pure virtual function?", "A function with = 0",
                                                "A function with no body",
                                                "A static function", "None", "option1");
                                add(list, "Which of these handles dynamic memory allocation?", "new", "malloc", "alloc",
                                                "create",
                                                "option1");
                                add(list, "What is the size of an empty class in C++?", "1 byte", "0 byte", "2 bytes",
                                                "4 bytes",
                                                "option1");
                                add(list, "Which concept supports reusability?", "Inheritance", "Polymorphism",
                                                "Encapsulation",
                                                "Abstraction", "option1");
                                add(list, "Destructor name is preceded by which symbol?", "~", "!", "#", "$",
                                                "option1");
                        }
                } else if (topic.contains("java")) {
                        if (isEasy) {
                                add(list, "What is the size of int in Java?", "32 bit", "16 bit", "64 bit", "8 bit",
                                                "option1");
                                add(list, "Which keyword is used to define a class?", "class", "Class", "struct",
                                                "define", "option1");
                                add(list, "Which method is the entry point of a Java program?", "main", "start", "init",
                                                "run",
                                                "option1");
                                add(list, "Java is what kind of language?", "Object-Oriented", "Procedural",
                                                "Functional", "Logic",
                                                "option1");
                                add(list, "Which package is imported by default?", "java.lang", "java.util", "java.io",
                                                "java.net",
                                                "option1");
                        } else {
                                add(list, "Which keyword prevents method overriding?", "final", "static", "const",
                                                "abstract",
                                                "option1");
                                add(list, "What is the parent class of all classes in Java?", "Object", "Class",
                                                "System", "String",
                                                "option1");
                                add(list, "ArrayList implements which interface?", "List", "Set", "Map", "Queue",
                                                "option1");
                                add(list, "Which exception is checked?", "IOException", "NullPointerException",
                                                "ArithmeticException",
                                                "IndexOutOfBounds", "option1");
                                add(list, "What implies that a variable value cannot be changed?", "final", "static",
                                                "const",
                                                "volatile", "option1");
                        }
                } else if (topic.contains("dsa") || topic.contains("data") || topic.contains("algo")
                                || topic.contains("structure")) {
                        if (isEasy) {
                                add(list, "Which data structure uses LIFO?", "Stack", "Queue", "Array", "Tree",
                                                "option1");
                                add(list, "Which data structure uses FIFO?", "Queue", "Stack", "Heap", "Graph",
                                                "option1");
                                add(list, "Access time of Array element by index?", "O(1)", "O(n)", "O(log n)",
                                                "O(n^2)", "option1");
                                add(list, "Which is a linear data structure?", "LinkedList", "Tree", "Graph", "Heap",
                                                "option1");
                                add(list, "What is the full form of DSA?", "Data Structures and Algorithms",
                                                "Data System Analysis",
                                                "Data Storage Area", "None", "option1");
                        } else {
                                add(list, "Time complexity of Binary Search?", "O(log n)", "O(n)", "O(n log n)", "O(1)",
                                                "option1");
                                add(list, "Worst case complexity of Bubble Sort?", "O(n^2)", "O(n)", "O(n log n)",
                                                "O(1)", "option1");
                                add(list, "Which sorting algorithm is stable?", "Merge Sort", "Quick Sort", "Heap Sort",
                                                "Selection Sort", "option1");
                                add(list, "Height of complete binary tree with N nodes?", "log N", "N", "N^2", "1",
                                                "option1");
                                add(list, "Dijkstra algorithm is used for?", "Shortest Path", "Sorting", "Searching",
                                                "Encryption",
                                                "option1");
                        }
                } else if (topic.contains("html") || topic.contains("web")) {
                        if (isEasy) {
                                add(list, "What does HTML stand for?", "Hyper Text Markup Language",
                                                "Home Tool Markup Language",
                                                "Hyperlinks and Text Markup Language", "None", "option1");
                                add(list, "Which tag is used for the largest heading?", "<h1>", "<h6>", "<head>",
                                                "<header>",
                                                "option1");
                                add(list, "Which tag is used to create a link?", "<a>", "<link>", "<href>", "<url>",
                                                "option1");
                                add(list, "Which attribute specifies the image source?", "src", "href", "link", "alt",
                                                "option1");
                                add(list, "Which tag creates a line break?", "<br>", "<lb>", "<break>", "<ln>",
                                                "option1");
                        } else {
                                add(list, "Which HTML5 tag is used for navigation?", "<nav>", "<navigation>", "<menu>",
                                                "<dir>",
                                                "option1");
                                add(list, "What is the correct type for checkbox input?", "checkbox", "check", "box",
                                                "tick",
                                                "option1");
                                add(list, "Which element is used for a dropdown list?", "<select>", "<input>", "<list>",
                                                "<dropdown>",
                                                "option1");
                                add(list, "How do you define an internal style sheet?", "<style>", "<css>", "<script>",
                                                "<link>",
                                                "option1");
                                add(list, "Which input type is not supported in HTML5?", "color", "date",
                                                "datetime-local", "file",
                                                "option2"); // Trick question support
                        }
                } else if (topic.contains("css")) {
                        if (isEasy) {
                                add(list, "What does CSS stand for?", "Cascading Style Sheets", "Creative Style Sheets",
                                                "Computer Style Sheets", "Colorful Style Sheets", "option1");
                                add(list, "Which property changes text color?", "color", "text-color", "font-color",
                                                "fg-color",
                                                "option1");
                                add(list, "Which property controls text size?", "font-size", "text-size", "font-style",
                                                "size",
                                                "option1");
                                add(list, "How do you select an element with id 'demo'?", "#demo", ".demo", "demo",
                                                "*demo", "option1");
                                add(list, "How do you select elements with class 'test'?", ".test", "#test", "test",
                                                "*test",
                                                "option1");
                        } else {
                                add(list, "Which property is used for outer space?", "margin", "padding", "border",
                                                "spacing",
                                                "option1");
                                add(list, "Which property is used for inner space?", "padding", "margin", "border",
                                                "spacing",
                                                "option1");
                                add(list, "Default position value is?", "static", "relative", "absolute", "fixed",
                                                "option1");
                                add(list, "Which property works with z-index?", "position", "float", "display",
                                                "overflow", "option1");
                                add(list, "How to make a list correctly?", "list-style-type", "list-type", "ul-style",
                                                "type",
                                                "option1");
                        }
                } else if (topic.contains("js") || topic.contains("javascript")) {
                        if (isEasy) {
                                add(list, "Inside which HTML element do we put JavaScript?", "<script>", "<js>",
                                                "<javascript>",
                                                "<scripting>", "option1");
                                add(list, "How do you write 'Hello World' in an alert box?", "alert('Hello World')",
                                                "msg('Hello World')", "msgBox('Hello World')",
                                                "alertBox('Hello World')", "option1");
                                add(list, "How do you create a function in JavaScript?", "function myFunction()",
                                                "function:myFunction()", "create myFunction()", "def myFunction()",
                                                "option1");
                                add(list, "How do you call a function named 'myFunction'?", "myFunction()",
                                                "call myFunction()",
                                                "call function myFunction()", "execute myFunction()", "option1");
                                add(list, "How to write a comment in JavaScript?", "//", "'", "<!--", "#", "option1");
                        } else {
                                add(list, "Which event occurs when the user clicks on an HTML element?", "onclick",
                                                "onchange",
                                                "onmouseover", "onmouseclick", "option1");
                                add(list, "How do you declare a JavaScript variable?", "var carName;",
                                                "variable carName;",
                                                "v carName;", "val carName;", "option1");
                                add(list, "Which operator is used to assign a value?", "=", "-", "*", "x", "option1");
                                add(list, "What will the following code return: Boolean(10 > 9)", "true", "false",
                                                "NaN", "undefined",
                                                "option1");
                                add(list, "Is JavaScript case-sensitive?", "Yes", "No", "Depends on OS", "None",
                                                "option1");
                        }
                } else if (topic.contains("python")) {
                        if (isEasy) {
                                add(list, "How do you output text in Python?", "print()", "echo()", "printf()", "cout",
                                                "option1");
                                add(list, "How do you create a variable?", "x = 5", "var x = 5", "int x = 5",
                                                "let x = 5", "option1");
                                add(list, "Which symbol is used for comments?", "#", "//", "/*", "--", "option1");
                                add(list, "Which collection is ordered and changeable?", "List", "Tuple", "Set",
                                                "Dictionary",
                                                "option1");
                                add(list, "Which operator is used for exponentiation?", "**", "^", "*", "exp",
                                                "option1");
                        } else {
                                add(list, "How do you start a function definition?", "def", "function", "create",
                                                "func", "option1");
                                add(list, "Which statement is used for exception handling?", "try-except", "try-catch",
                                                "do-catch",
                                                "try-rescue", "option1");
                                add(list, "How do you create a dictionary?", "{}", "[]", "()", "<>", "option1");
                                add(list, "Which method removes whitespace from beginning/end?", "strip()", "trim()",
                                                "cut()", "len()",
                                                "option1");
                                add(list, "What is the correct file extension for Python files?", ".py", ".pyt", ".pt",
                                                ".python",
                                                "option1");
                        }
                }

                // Fallback if list is empty (unknown topic)
                if (list.isEmpty()) {
                        add(list, "What is a key feature of " + topic + "?", "Feature A", "Feature B", "Feature C",
                                        "Feature D", "option1");
                        add(list, "Which statement is true regarding " + topic + "?", "Statement 1", "Statement 2",
                                        "Statement 3", "Statement 4", "option1");
                        add(list, "Explain the primary use of " + topic + ".", "Use Case X", "Use Case Y", "Use Case Z",
                                        "None of the above", "option1");
                        add(list, "Advanced concept in " + topic + ":", "Concept 1", "Concept 2", "Concept 3",
                                        "Concept 4", "option1");
                        add(list, "Identify the correct syntax in " + topic + ".", "Syntax A", "Syntax B", "Syntax C",
                                        "Syntax D", "option1");
                }

                return list;
        }

        private void add(List<Question> list, String content, String o1, String o2, String o3, String o4, String ans) {
                Question q = new Question();
                q.setContent(content);
                q.setOption1(o1);
                q.setOption2(o2);
                q.setOption3(o3);
                q.setOption4(o4);
                q.setAnswer(ans);
                list.add(q);
        }
}
