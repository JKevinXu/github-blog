---
layout: post
title: "Eigenvectors in Google Search: A Simple Explanation"
date: 2025-05-08 09:00:00 +0800
categories: daily-notes
---

# Eigenvectors in Google Search: How PageRank Works

Google's revolutionary PageRank algorithm, which powers its search engine, relies on a mathematical concept called eigenvectors. Let me break this down into a simple explanation.

## What are Eigenvectors?

In linear algebra, an eigenvector is a special vector that, when transformed by a specific matrix, only changes in scale (not direction). The amount by which it scales is called the eigenvalue.

Think of it this way: if you have a transformation (like stretching or rotating), an eigenvector is a direction that maintains its orientation during that transformation - it just gets longer or shorter.

## How PageRank Uses Eigenvectors

The PageRank algorithm views the internet as a giant matrix of connections between pages. Each webpage is ranked by importance based on:

1. How many other pages link to it
2. The importance of those linking pages

This creates a circular definition: a page is important if important pages link to it. This is where eigenvectors come in!

## A Simple Example

Imagine a tiny web with just 3 pages (A, B, and C):
- Page A links to both B and C
- Page B links to C
- Page C links to A

We can represent this as a matrix where each entry represents the probability of moving from one page to another:

```
    A    B    C
A   0   1/2  1/2
B   0    0    1
C   1    0    0
```

This is called a transition matrix. Reading across row A, we see that if we're on page A, there's a 0.5 probability of going to page B and a 0.5 probability of going to page C. Similarly, from page B, we always go to page C (probability 1), and from page C, we always go to page A.

### Why Do We Care About Eigenvectors?

Let's call our transition matrix M and imagine we have a vector v that represents the probability of being on each page at a given moment. For example, v = [0.33, 0.33, 0.33] would mean we have an equal chance of being on any page.

After one step of clicking links randomly, our new distribution would be M×v. After another step, it would be M×(M×v) = M²×v, and so on.

What happens if we keep clicking links forever? It turns out that regardless of our starting position, we eventually reach a steady state where our probability distribution no longer changes. This steady state is precisely the eigenvector of the transition matrix corresponding to the eigenvalue 1.

### Computing the Eigenvector

For our small example, we can calculate the eigenvector directly by solving the equation:

M×v = v

Or rearranged: (M - I)×v = 0, where I is the identity matrix.

Solving this system gives us the eigenvector [0.4, 0.2, 0.4]. This means:
- 40% of the time, a random surfer will be on page A
- 20% of the time, they'll be on page B
- 40% of the time, they'll be on page C

We can verify this is correct:

```
[ 0    0.5  0.5 ]   [ 0.4 ]   [ 0.4 ]
[ 0    0    1   ] × [ 0.2 ] = [ 0.2 ]
[ 1    0    0   ]   [ 0.4 ]   [ 0.4 ]
```

Interpret this as:
1. Page A has high importance (0.4) because the important page C links to it
2. Page B has lower importance (0.2) because it only receives links from A, which splits its importance
3. Page C has high importance (0.4) because it receives links from both A and B

### Scaling to Google's Size

The actual web has billions of pages, making this matrix enormous. Google uses the power iteration method to compute the PageRank vector efficiently:
1. Start with a random vector (e.g., equal probability for all pages)
2. Repeatedly multiply by the transition matrix until convergence
3. Apply adjustments for pages with no outgoing links and add a "teleportation" factor (typically 0.15) to ensure the algorithm converges

This is a simplified version of how Google originally ranked billions of webpages, revolutionizing search and making the internet navigable. 